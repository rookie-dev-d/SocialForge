/**
 *
 * OrderMeta
 *
 */

import React from 'react';

import { Link } from 'react-router-dom';
import { Row, Col } from 'reactstrap';

import { formatDate } from '../../helpers/date';
import Button from '../Button';

const OrderMeta = props => {
  const { order, role,cancelOrder ,completeOrderItem} = props;

  return (
    <div className='order-meta'>
      <div className='d-flex align-items-center justify-content-between mb-3 title'>
        <h2 className='mb-0'>Order Details</h2>
        <Link className='redirect-link' to={'/dashboard/orders'}>
          Back to orders
        </Link>
      </div>

      <Row>
        <Col xs='12' md='8'>
          <Row>
            <Col xs='4'>
              <p className='one-line-ellipsis'>Order Number</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{` ${order._id}`}</span>
            </Col>
          </Row>
          <Row>
            
            <Col xs='4'>
              <p className='one-line-ellipsis'>Order Date</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{` ${formatDate(
                order.created
              )}`}</span>
            </Col>
          </Row>


          <Row>
            
            <Col xs='4'>
              <p className='one-line-ellipsis'>Order Date</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{` ${formatDate(
                order.created
              )}`}</span>
            </Col>
          </Row>



{role==="ROLE_MEMBER"?null:
<React.Fragment>
          <Row>
            
            <Col xs='4'>
              <p className='one-line-ellipsis'>Customer Name</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{
                order.Name
              }</span>
            </Col>
          </Row>


          <Row>
            
            <Col xs='4'>
              <p className='one-line-ellipsis'>Customer phonNumber</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{
                order.userphonNumber
              }</span>
            </Col>
          </Row>



          <Row>
            
            <Col xs='4'>
              <p className='one-line-ellipsis'>Customer Email</p>
            </Col>
            <Col xs='8'>
              <span className='order-label one-line-ellipsis'>{(
                order.useremail
              )}</span>
            </Col>
          </Row>
          </React.Fragment>

              }



          



        </Col>





       
        
        {order.products[0].status==="Delivered"
        ?
      null

          :
          <Col xs='12' md='4' className='text-left text-md-right'>
          <Button
            id='CancelOrderItemPopover'
            size='sm'
            style={{margin:".5rem"}}

            text='Cancel Order'
            onClick={cancelOrder}

          />
          
          {role==="ROLE_MEMBER"?null:
          <Button
          id=''
          style={{margin:".5rem"}}
          size='sm'
          text='Complete'
          onClick={completeOrderItem}
        />}

            </Col>}

       

       


      </Row>
    </div>
  );
};

export default OrderMeta;
