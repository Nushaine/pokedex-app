import { StatusBar } from 'expo-status-bar';
import React, {Component} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Button } from 'react-native';

import {bundleResourceIO} from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

var jpeg = require('jpeg-js');
var Buffer = require('buffer/').Buffer

export default class Home extends Component {

  constructor(props:any) {
    super(props)
    
    this.state = {
      displayText: 'loading',
      imagePath: "../assets/blastoise.jpg",
      imageSource: require("../assets/blastoise.jpg"),
      prediction: 'none',
      image: '',
      predictionFound: false,
      output: false,
      type: Camera.Constants.Type.back
    }
  }

  async componentDidMount(){
      const { status } = await Camera.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
      }
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      this.setState({image: result.uri});
    }
    this.getPredictions(result.uri)
  };

  getPredictions = async (imgPath: string) => {
    // loading tensorflow
    this.setState({displayText: 'loading tensorflow'})
    await tf.ready()

    // loading model
    this.setState({displayText: 'loading model'})
    const modelJson = require("../cnn_model/model.json");
    const modelWeights = require("../cnn_model/group1-shard1of1.bin");
    const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));

    //converting image jpg to arraybuffer (binary data)
    this.setState({displayText: 'converting image to binary'})

    let binaryImage = await FileSystem.readAsStringAsync(imgPath, {encoding: FileSystem.EncodingType.Base64})
    const buffer = new Buffer(binaryImage, 'base64')


    //convert buffer to tensor
    this.setState({displayText: 'converting binary to tensor'})
    const imageTensor = this.bufferToTensor(buffer)

    // get prediction
    this.setState({displayText: 'getting prediction'})
    const input = tf.image.resizeBilinear(imageTensor, [32, 32])
    const modelOutput = await model.predict(input).dataSync() // datasync method downloads the tensor output
    for(let i=0; i<modelOutput.length; i+=1){
      if(modelOutput[i]==1){
        this.setState({prediction: i})
      } else {
        if(i-1 == modelOutput.length){
          this.setState({prediction: null})
        }
      }
    }
    
    

    this.setState({displayText: 'prediction result: ' + this.state.prediction})



  }

  bufferToTensor = (bufferData:any)=>{
    console.log('entered function')

    const output = jpeg.decode(bufferData, true)
    console.log('converting to unitarray')
    const buffer = new Uint8Array(output.width*output.height*3)
    console.log('started loop')
    //getting rid of alpha values, only need rgb (not rgba)
    let offset = 0;
    for(let i=0; i<buffer.length;i+=4 ) {
      buffer[i] = output.data[offset] // adding 'r' values to array
      buffer[i+1] = output.data[offset+1] // adding 'g' values to array
      buffer[i+2] = output.data[offset+2] // adding 'b' values to array
      buffer[i+3] = output.data[offset+3] // adding 'a' values to array
      offset += 4 
    }
    console.log('returning output')
    return tf.tensor3d(buffer, [output.height, output.width, 3]).expandDims()
  }
  


  render() {
    if (this.state.status === null) {
      return <View />;
    }
    if (this.state.status === false) {
      return <Text style={{justifyContent: 'center', alignItems: 'center'}}>No access to camera</Text>;
    }
    return (
      <View style={styles.container}>
      <Camera style={styles.camera} type={this.state.type}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              
              const cameraType = this.state.type === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back
              this.setState({type: cameraType});
            }}>
            <Text style={styles.text}> Flip </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});