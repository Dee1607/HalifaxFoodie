import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { ListGroup, Button, Row, Col, Card } from 'react-bootstrap'
import firebase from 'firebase'
import { Auth } from 'aws-amplify'
import Message from '../components/Message'
import axios from 'axios'

const OrderNowPage = () => {
  const { restaurant } = useParams()

  const [dishes, setDishes] = useState([])
  const [msg, setMsg] = useState('')

  const history = useHistory()

  const ref_restaurants = firebase.firestore().collection('restaurants')
  const ref_user_orders = firebase.firestore().collection('user_orders')

  const generateRandonOrderId = () => {
    var randomString = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = characters.length
    const prefix = Auth.user.username.toUpperCase()

    for (var i = 0; i < 10; i++) {
      randomString += characters.charAt(Math.floor(Math.random() * length))
    }

    let orderId = prefix.concat('_' + randomString)

    return orderId
  }

  // function to post restaurant data to GCP for report generation
  const postData = ()=> {
    axios({
      method: 'post',
      url: 'https://halifax-foodie-ml-4z2wswh5ea-uc.a.run.app/uploadrestaurant',
      data: {
        msg: 'testing',
        text: restaurant
      },
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        console.log(response.data.output);
        let responseObj = response.data.output;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  var generatedID = generateRandonOrderId();
  const [data, setData] = useState({
    orderId: generatedID,
    order: "",
    order_id: "",
    price: "",
    restaurant: "",
    status: "",
    time: ""
  })

  const orderNowHandler = (dish) => {
  
      data.orderId= generatedID
      data.order= dish.name
      data.price= dish.price
      data.restaurant= restaurant
      data.status= 'Order Placed'
      data.time= Date.now()

    const orderId = generatedID
    const user = {
      order: dish.name,
      order_id: orderId,
      price: dish.price,
      restaurant: restaurant,
      status: 'Order Placed',
      time: Date.now(),
    }
    ref_user_orders
      .doc(orderId)
      .set(user)
      .then(() => {
        console.log('Order Stored in Database')
        setMsg('Order Placed!')
        setTimeout(() => {
          history.push('/orders')
        }, 3000)
      })
      .catch((err) => {
        console.error('Error in orderNowHandler: ' + err)
      })

      postData()

      console.log("DYNAMODB: Storing Data...")
      //Add Lambda Code Here For DynamoDB
      console.log("DATA:-->",data)
      axios.post("https://l37fvpofd3.execute-api.us-east-1.amazonaws.com/default/storeOrderLambda",JSON.stringify({data: data})).then((response) => {

        console.log(response);
          alert('Successfully stored data into database');
      }).catch((error) => {
          console.log("Eroor")
      })
  }

  useEffect(() => {
    const getRestaurantDishes = () => {
      ref_restaurants.doc(restaurant.toLowerCase()).onSnapshot((doc) => {
        console.log('Dishes: ', doc.data().dishes[0].name)
        let arr = []
        for (let i = 0; i < doc.data().dish_count; i++) {
          let tempObj = {
            name: doc.data().dishes[i].name,
            price: doc.data().dishes[i].price,
          }
          arr.push(tempObj)
        }
        setDishes(arr)
      })
    }
    getRestaurantDishes()
    // eslint-disable-next-line
  }, [])

  return (
    <div>
      {msg.length !== 0 && <Message varient='success'>{msg}</Message>}
      SELECT YOUR ORDER FROM - {restaurant}
      <hr />
      <Row className='mt-2 d-flex flex-row justify-content-between flex-wrap'>
        {dishes.map((dish) => (
          <Col key={dish.name} className='my-3'>
            <Card
              style={{ width: '18rem', fontSize: '8px' }}
              className='m-auto'
            >
              <Row>
                <Col>
                  <ListGroup variant='flush'>
                    <ListGroup.Item>
                      <h3>{dish.name}</h3>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <h3>Price: ${dish.price}</h3>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Button
                        onClick={() => orderNowHandler(dish)}
                        disabled={dish.status === false}
                        style={{
                          backgroundColor: '#006400',
                          borderColor: '#006400',
                          borderRadius: '2px',
                        }}
                      >
                        Place Order
                      </Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default OrderNowPage
