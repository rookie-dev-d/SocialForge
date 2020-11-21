/*
 *
 * Order
 *
 */

import React,{useState,useEffect} from 'react';
import { connect } from 'react-redux';

import actions from '../../actions';

import SubPage from '../../components/SubPage';
import NotFound from '../../components/NotFound';
import LoadingIndicator from '../../components/LoadingIndicator';
import OrderList from '../../components/OrderList';
// import { Button } from 'react-bootstrap';

import Button from '../../components/Button';
// /home/usman/Desktop/mern-ecommerce/client/app/components/Button


 const Order =(props)=> {

    const [requeireddata,setrequeireddata]=useState("Not processed")

 const handthoselecompler=()=>{
    setrequeireddata('Delivered')

  }

  const handleuncompler=()=>{
    setrequeireddata('Not processed')

  }

 
  useEffect(()=>{
    props.fetchOrders(requeireddata);
  },[requeireddata])

    const { orders, isLoading,role } = props;


    return (

         


      <div className='order-dashboard'>
      <div 
      style={{
        display:"flex",
        justifyContent:'end',
        padding:'.5rem'
        
        
      }}
      >
          <Button
          onClick={handthoselecompler}
          text="Delivered"
          style={{margin:'.5rem'}}
          />
          <Button
          style={{margin:'.5rem'}}
        
          onClick={handleuncompler}
          text="Not processed"
        />
          </div>
         
        <SubPage title={'Customers Orders'} isMenuOpen={null}>
          {isLoading ? (
            <LoadingIndicator inline />
          ) : orders.length > 0 ? (
            <OrderList orders={orders}/>
          ) : (
            <NotFound message='you have no orders yet!' />
          )}
        </SubPage>

      

      </div>

    );
  }

const mapStateToProps = state => {
  return {
    orders: state.order.orders,
    useroradman:state.order.useroradman,
    isLoading: state.order.isLoading,
    isOrderAddOpen: state.order.isOrderAddOpen
  };
};

export default connect(mapStateToProps, actions)(Order);
