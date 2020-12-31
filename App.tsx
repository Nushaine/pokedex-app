import { StatusBar } from 'expo-status-bar';
import React, {Component} from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import AppStack from "./navigators/appStack";

export default class App extends Component {



  render() {
    return (
        <AppStack />
    );
  }
}

