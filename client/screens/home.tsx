import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import { MaterialIcons, Feather } from '@expo/vector-icons';

type OverviewScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Overview'>;

export default function Home() {
  const navigation = useNavigation<OverviewScreenNavigationProps>();
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    const askPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed to record audio.');
      } else {
        setPermissionGranted(true);
      }
    };

    askPermission();

    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  async function startRecording() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;
      
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      // Navigate to loading screen with the recording URI
      navigation.navigate('Processing', { recordingUri: uri });

    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  }

  const handleRecordPress = async () => {
    if (!permissionGranted) {
      Alert.alert('No Mic Access', 'Microphone permission was not granted.');
      return;
    }

    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const goToRecordings = () => {
    navigation.navigate('Recordings');
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#121212] px-6 pt-16">
      <TouchableOpacity
        className="absolute right-6 top-20 z-10 rounded-full bg-gray-100 dark:bg-[#1E1E1E] px-5 py-3 shadow-sm"
        onPress={goToRecordings}>
        <View className="flex-row items-center">
          <MaterialIcons name="history" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Past Recordings</Text>
        </View>
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <View className="h-72 w-72 items-center justify-center">
          <View className={`absolute h-full w-full rounded-full ${
            isRecording ? 'bg-rose-400/30 dark:bg-rose-700/30' : 'bg-indigo-400/30 dark:bg-indigo-700/30'
          }`} style={{
            transform: [{ scale: 1.2 }]
          }} />
          
          {isRecording && (
            <View className={`absolute h-full w-full rounded-full bg-rose-400/40 dark:bg-rose-700/40`} 
              style={{
                transform: [{ scale: 1.3 }],
                opacity: 1
              }}
            />
          )}
          
          <TouchableOpacity
            onPress={handleRecordPress}
            className={`h-64 w-64 items-center justify-center rounded-full ${
              isRecording ? 'bg-rose-500 dark:bg-rose-600' : 'bg-indigo-500 dark:bg-indigo-600'
            }`}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <View className="h-12 w-12 rounded-md bg-white" />
            ) : (
              <Feather name="mic" size={48} color="white" />
            )}
          </TouchableOpacity>
        </View>

        <Text className="mt-16 text-xl font-semibold text-gray-800 dark:text-gray-100">
          {isRecording ? 'Recording...' : 'Tap to Record'}
        </Text>
        
        <Text className="mt-4 text-center text-gray-500 dark:text-gray-400 max-w-xs">
          {isRecording 
            ? 'Press again to stop recording' 
            : 'Hold your phone close to capture clear audio'}
        </Text>
      </View>
    </View>
  );
}