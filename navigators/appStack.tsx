import { createAppContainer } from 'react-navigation';
import { createStackNavigator, TransitionPresets } from 'react-navigation-stack';
import Home from "../screens/homePage"


const QuestionNavigator = createStackNavigator({
    
  Home: {
    screen: Home,
    navigationOptions: {
        headerShown: false,
    }
},

}, {
    initialRouteName:'Home',
});

export default createAppContainer(QuestionNavigator);