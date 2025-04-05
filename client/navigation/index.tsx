import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home';
import Processing from '../screens/processing';
import Results from '../screens/results';
import Recordings from 'screens/recordings';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RootStackParamList = {
  Home: undefined;
  Processing: { recordingUri: string };
  Results: {
    id: string;
    recordingUri: string;
    fullText: string;
    insights: {
      summary: string;
      key_points: string[];
      test_questions: string[];
      glossary: { term: string; definition: string }[];
      lecture_structure: string[];
      action_items: string[];
      study_plan: { [day: string]: string };
    };
  };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Processing" component={Processing} />
        <Stack.Screen name="Results" component={Results} />
        <Stack.Screen name="Recordings" component={Recordings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
