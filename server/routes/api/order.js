const express = require('express');
const router = express.Router();

// Bring in Models & Helpers
const Order = require('../../models/order');
const Cart = require('../../models/cart');
const auth = require('../../middleware/auth');
const mailgun = require('../../services/mailgun');
const taxConfig = require('../../config/tax');
const { loadPartialConfig } = require('@babel/core');
const { Card } = require('reactstrap');

router.post('/add', auth, async (req, res) => {
  try {
    const cart = req.body.cartId;
    const total = req.body.total;
    const user = req.user._id;

    const order = new Order({
      cart,
      user,
      total
    });

    const orderDoc = await order.save();

    await Order.findById(orderDoc._id).populate('cart user', '-password');

    const cartDoc = await Cart.findById(orderDoc.cart._id).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });

    const newOrder = {
      _id: orderDoc._id,
      created: orderDoc.created,
      user: orderDoc.user,
      total: orderDoc.total,
      products: cartDoc.products
    };

    await mailgun.sendEmail(order.user.email, 'order-confirmation', newOrder);

    res.status(200).json({
      success: true,
      message: `Your order has been placed successfully!`,
      order: { _id: orderDoc._id }
    });
  } catch (error) {}
});

// fetch all orders api
router.post('/list', auth, async (req, res) => {
  const requeireddata=req.body.order;
  let abc=null;
  let useroradman=false;
 
  try {
    const user = req.user._id;
    const isAdman = req.user.role;
    let orders=null;
    if(isAdman==="ROLE_ADMIN"){
      orders = await Order.find().populate({
        path: 'cart'
      });
       useroradman=true;

    }else{
      orders = await Order.find({ user }).populate({
        path: 'cart'
      });

    }
  
   

    const newOrders = await orders.filter(order => order.cart);

    if (newOrders.length > 0) {
      let newDataSet = [];

     await Promise.all(newOrders.map(async doc => {
        const cartId = doc.cart._id;


        const cart = await Cart.find({_id:cartId,'products.status':requeireddata}).populate({
          path: 'products.product',
          populate: {
            path: 'brand'
          }
        });
        


        if(cart.length>0){

          
          const  order = {
            _id: doc._id,
            total: parseFloat(Number(doc.total.toFixed(2))),
            created: doc.created,
            products: cart[0].products
          };
          newDataSet.push(order);
        }

         
      
      }))
  
        res.status(200).json({
        orders: newDataSet,
        useroradman

          
        });
    

      
    } else {
      res.status(404).json({
        message: `You have no orders yet!`
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'+error
    });
  }
});

// fetch order api
router.get('/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const user = req.user._id;
    const isAdman = req.user.role;
    let orderDoc=null;

    
    if(isAdman==="ROLE_ADMIN"){

      orderDoc = await Order.findOne({ _id: orderId }).populate('user').populate('card')

    }else{
      orderDoc = await Order.findOne({ _id: orderId,user }).populate({
        path: 'cart'
      });
    }




   

    if (!orderDoc) {
      res.status(404).json({
        message: `Cannot find order with the id: ${orderId}.`
      });
    }

    const cart = await Cart.findById(orderDoc.cart._id).populate({
      path: 'products.product',
      populate: {
        path: 'brand'
      }
    });

    let order = {
      _id: orderDoc._id,
      cartId: orderDoc.cart._id,
      total: orderDoc.total,
      totalTax: 0,
      created: cart.created,
      products: cart.products,
      Name:orderDoc.user.firstName +' '+orderDoc.user.lastName|| '',
      userphonNumber:orderDoc.user.phonNumber||'' ,
      useremail:orderDoc.user.email||' '
    };

    order = caculateTaxAmount(order);

    res.status(200).json({
      order
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

router.delete('/cancel/:orderId', auth, async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId });

    await Order.deleteOne({ _id: orderId });
    await Cart.deleteOne({ _id: order.cart });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});




router.patch('/complete/:orderId', auth, async (req, res) => {

const data=await Cart.findById({_id:req.body.cartId});
     
  if(data){

      data.products[0].status='Delivered';

      const result=await data.save();


      res.status(200).json({
        orderCancelled: true
      });

  


}

});






router.put('/cancel/item/:itemId', auth, async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const orderId = req.body.orderId;
    const cartId = req.body.cartId;

    await Cart.updateOne(
      { 'products._id': itemId },
      {
        'products.$.status': 'Cancelled'
      }
    );

    const cart = await Cart.findOne({ _id: cartId });
    const items = cart.products.filter(item => item.status === 'Cancelled');

    // All items are cancelled => Cancel order
    if (cart.products.length === items.length) {
      await Order.deleteOne({ _id: orderId });
      await Cart.deleteOne({ _id: cartId });

      return res.status(200).json({
        success: true,
        orderCancelled: true,
        message: 'You order has been cancelled successfully!'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item has been cancelled successfully!'
    });
  } catch (error) {
    res.status(400).json({
      error: 'Your request could not be processed. Please try again.'
    });
  }
});

// calculate order tax amount
const caculateTaxAmount = order => {
  const taxRate = taxConfig.stateTaxRate;

  order.totalTax = 0;

  order.products.map(item => {
    if (item.product.taxable) {
      const price = Number(item.product.price).toFixed(2);
      const taxAmount = Math.round(price * taxRate * 100) / 100;
      item.priceWithTax = parseFloat(price) + parseFloat(taxAmount);
      order.totalTax += taxAmount;
    }

    item.totalPrice = parseFloat(item.totalPrice.toFixed(2));
  });

  order.totalWithTax = order.total + order.totalTax;

  order.total = parseFloat(Number(order.total.toFixed(2)));
  order.totalTax = parseFloat(
    Number(order.totalTax && order.totalTax.toFixed(2))
  );
  order.totalWithTax = parseFloat(Number(order.totalWithTax.toFixed(2)));
  return order;
};

module.exports = router;