import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home';
import Processing from '../screens/processing';
import Results from '../screens/results';

export type RootStackParamList = {
  Home: undefined;
  Processing: { recordingUri: string };
  Results: {
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
        }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Processing" component={Processing} />
        <Stack.Screen name="Results" component={Results} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
