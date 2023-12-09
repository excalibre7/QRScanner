import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button,Dimensions,Alert,FlatList,Platform,TouchableHighlight,ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [users, setUsers] = useState([]);

  const getData = async () => {
    setLoading(true)
    fetch("http://studioeapi.bluekaktus.com/api/alumni", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        "id": 1,
        "name": "Arnav",
        "key": "afhsdjkgkdjf",
        "apiType": "GET"
    })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        console.log(responseJson)
        if(responseJson.Message=="Guest List Fetched"){
          setUsers(responseJson.result)
        }else{
          Alert.alert("An error occured")
        }
      })
      .catch((error) => Alert.alert("Alert!!!  " + error)); //to catch the errors if any
  }
  const updateData = async (value) => {
    setLoading(true)
    var subStrings = value.split("-");
    if(subStrings.length>3){
      var id = subStrings[0]+subStrings[1]
      var name = subStrings[2]
      fetch("http://studioeapi.bluekaktus.com/api/alumni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          "id": id,
          "name": name,
          "key": value,
          "apiType": "INSERT"
      })
      })
        .then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if(responseJson.Message=="Successful scan. Welcome to the event"){
            setShowQR(false)
            setUsers(responseJson.result)
            twoAlert("Success!!",responseJson.Message)
          }else{
            twoAlert("Error",responseJson.Message)
            setUsers(responseJson.result)
          }
        })
        .catch((error) => Alert.alert("Alert!!!  " + error)); //to catch the errors if any
      }else{
        Alert.alert("Invalid QR")
        setLoading(false)
        setShowQR(false)
      }
  }

  useEffect(() => {
    // Request permissions for the camera
    const getPermissions = async () => {
      console.log('Requesting permissions');
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    
    // Get all the data from the database
    getData();
    
    // Call the function that requests permissions
    getPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(data)
    // if(userAlreadyExists(data)){
    //   twoAlert("Uh Oh",`${data} has already checked in!`);
    // }else{
    //   twoAlert("Welcome",`${data} has been checked in!`);
    //   console.log("Data scanned")
    //   var current = new Date();
    //   var time = current.getHours()+" : "+current.getMinutes();
    //   var subStrings = data.split("-");
    //   var id = subStrings[0]+subStrings[1]
    //   var name = subStrings[2]
    //   var temp = {key:data,id:id,name:name,time:time}
    //   console.log(temp)
      updateData(data)
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const twoAlert = (title,message) =>
  Alert.alert(
    title,
    message,
    [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      { text: "OK", onPress: () => console.log("OK Pressed") }
    ]
  );

  console.log(users)

  return (
      <View style={styles.container}>
       
        <Text style={{fontSize:24,padding:8,borderRadius:8,backgroundColor:"#007AFFDD",color:"#FFFFFF"}} onPress={()=> {setScanned(false);setShowQR(!showQR)}}>{showQR?"Cancel":"Scan QR"}</Text>
        {showQR?<BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          style={{width:width*.9,height:width*.9,margin:12,borderRadius:12}}
        />:null}
        {loading?<ActivityIndicator size="large" color="#007AFFDD" />
          :users.length==0?<Text style={{marginTop:20}}>{"No Enteries yet... :("}</Text>:<FlatList
          ItemSeparatorComponent={
            Platform.OS !== 'android' &&
            (({ highlighted }) => (
              <View
                style={[
                  style.separator,
                  highlighted && { marginLeft: 0 }
                ]}
              />
            ))
          }
          data={users}
          style={{marginTop:10}}
          renderItem={({ item, index, separators }) => (
            <TouchableHighlight
              key={item.key}
              onShowUnderlay={separators.highlight}
              onHideUnderlay={separators.unhighlight}>
              <View style={{ flex:1,justifyContent:"space-between",color:"#007AFFDD",flexDirection:"row",width:width*.9 }}>
                <Text style={{color:"#007AFFDD",fontSize:20}}>{item.name}</Text>
                <Text style={{color:"#007AFFDD",fontSize:20}}>{item.entryTime}</Text>
              </View>
            </TouchableHighlight>
          )}
        />}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:width/8,
    padding:8,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems:"center"
  },
});