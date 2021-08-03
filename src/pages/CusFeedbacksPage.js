import React, {useState, useEffect} from 'react';
import axios from 'axios';
import firebase from 'firebase'

const CusFeedbacksPage = () => {

    const [restaurantList, setRestaurantList] = useState([])
    
    const ref_restaurants = firebase.firestore().collection('restaurants')
    
    useEffect(() => {
        let arr = []
        ref_restaurants.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            arr.push(doc.data())
            })
            console.log(arr)
            setRestaurantList(arr)
        })
        
    }, [])

    console.log("REST:",restaurantList);

    const [data, setData] = useState({
        feedbackData: "",
        wordCloud: "",
        image: ""
    })

    const generateRandonOrderId = () => {
        var randomString = ''
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const length = characters.length
    
        for (var i = 0; i < 10; i++) {
          randomString += characters.charAt(Math.floor(Math.random() * length))
        }
        
        return randomString
      }

    const [feedbackData, setFeedbackData] = useState({
        id: generateRandonOrderId(),
        feedbackData: "", 
        restaurantName: "",
    })

    const onClick =  (event) => 
    {
        console.log('myuyyy',feedbackData)
        event.preventDefault();
        axios.post("https://mgvlaiw66a.execute-api.us-east-1.amazonaws.com/default/generateWordCloudG17",JSON.stringify({data: feedbackData})).then((response) => {

            let wordCloudData = ""
            response.data.Items.forEach((element, index) => {
                wordCloudData = wordCloudData + element.feedbackData;
                wordCloudData = wordCloudData + " ";
            });
 
            data.wordCloud= wordCloudData;

            onSubmit();
            alert('Successfully stored data into database');
        }).catch((error) => {
            console.log("Eroor")
        })
    }

    const onSubmit = () => 
    {
        // word cloud API Referance: https://wordcloudapi.com
        let text = data.wordCloud;
        axios({
            method: 'POST',
            url: 'https://textvis-word-cloud-v1.p.rapidapi.com/v1/textToCloud',
            headers: {
              'content-type': 'application/json',
              'x-rapidapi-key': 'f870c70cccmsh264557ff26f7acep1588fdjsn9d67394fc992',
              'x-rapidapi-host': 'textvis-word-cloud-v1.p.rapidapi.com'
            },
            data: {
              text: text,
              scale: 0.5,
              width: 400,
              height: 400,
              colors: ['#375E97', '#FB6542', '#FFBB00', '#3F681C'],
              font: 'Tahoma',
              use_stopwords: true,
              language: 'en',
              uppercase: false
            }
        }).then((response) => {
            data.image = response.data;
            console.log('image', response.data);
        }).catch((error) => {
            console.log("Eroor")
        })
    }

    const handleChange = (e) => {
        let res = {...feedbackData, [e.target.name]: e.target.value}
        setFeedbackData(res)      
    }

    return ( 
        <div>
            

            <div className="mt-4">
                <h3 style={{ "text-align":"left" }}>Feedback</h3>
            </div>
            <br />
            <div className="col-md-4"></div>
            <div className="col-md-4" style={{"alignContent":"right"}} style={{ "text-align":"left" }}>
                <div className="polaroid">
                        <img src={data.image} alt="Word Cloud" />
                        <div className="container">
                            <p> Word Cloud</p>
                        </div>
                    </div>
            </div>
                <div className="mt-4">
                    <form>
                    <p style={{ "text-align":"left" }}>Select the Restaurant:</p>
                    <p style={{ "text-align":"left" }}>
                    <select  name="restaurantName" onChange={(e) => handleChange(e)}>
                        <option>Select the restaurant</option>
                        {restaurantList.length > 0 &&  restaurantList.map(function (restaurant, index){
                            return <option value={restaurant.name}>{restaurant.name}</option>
                        })}
                    </select>
                    </p>

                        <p style={{ "text-align":"left" }}>Enter your feedback:</p>
                        <div className="col-md-4" style={{ "text-align":"left" }}>
                        <textarea
                            type="text"
                            id = "feedbackData"
                            name = "feedbackData"
                            onChange={(e) => handleChange(e)}
                        />
                        </div >
                        <div className="col-md-8"></div>
                        <div style={{ "text-align":"left" }}>
                            <button type="reset" className="btn btn-primary" placeholder="reset">Reset</button>
                            &nbsp;&nbsp;&nbsp;
                            <button type="submit" className="btn btn-primary" onClick={onClick} placeholder="submit">Submit</button>
                        </div>
                        
                    </form>
                </div>
        </div> 
    );
}

export default CusFeedbacksPage