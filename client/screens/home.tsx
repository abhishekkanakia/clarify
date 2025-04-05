import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation';
import { View, TouchableOpacity, Text, Alert, Animated, Easing } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import SettingsPopUp from 'components/SettingsPopUp';
import SubjectSelectionModal from 'components/SubjectSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OverviewScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Overview'>;

export default function Home() {
  const navigation = useNavigation<OverviewScreenNavigationProps>();
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showSubjectModal, setShowSubjectModal] = useState<boolean>(false);
  const [currentRecordingUri, setCurrentRecordingUri] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;

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
      pulseAnim.stopAnimation();
      waveAnim1.stopAnimation();
      waveAnim2.stopAnimation();
      waveAnim3.stopAnimation();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      startPulseAnimation();
      startWaveAnimation();
    } else {
      stopPulseAnimation();
      stopWaveAnimation();
    }
  }, [isRecording]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim1, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim3, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopWaveAnimation = () => {
    waveAnim1.stopAnimation();
    waveAnim2.stopAnimation();
    waveAnim3.stopAnimation();
    waveAnim1.setValue(0);
    waveAnim2.setValue(0);
    waveAnim3.setValue(0);
  };

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
      if (uri) {
        setCurrentRecordingUri(uri);
        setShowSubjectModal(true);
      } else {
        Alert.alert('Error', 'Failed to save recording');
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording');
    } finally {
      setRecording(null);
      setIsRecording(false);
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

  const onSubjectSelected = async (subject: string) => {
    setShowSubjectModal(false);

    if (!currentRecordingUri) {
      Alert.alert('Error', 'No recording found');
      return;
    }

    const settings = await AsyncStorage.getItem('settings');
    const parsedSettings = settings ? JSON.parse(settings) : {};
    const updatedSettings = {
      ...parsedSettings,
      currentClass: subject,
    };
    await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    console.log(subject);
    navigation.navigate('Processing', {
      recordingUri: currentRecordingUri,
      subject, // Make sure this is passed
    });
    setCurrentRecordingUri(null);
  };

  return (
    <View className="flex-1 bg-white px-6 pt-16 dark:bg-[#121212]">
      <TouchableOpacity
        className="absolute right-6 top-20 z-10 rounded-full bg-gray-100 px-5 py-3 shadow-sm dark:bg-[#1E1E1E]"
        onPress={goToRecordings}>
        <View className="flex-row items-center">
          <MaterialIcons name="history" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Past Recordings
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        className="absolute right-6 top-[120px] z-10 active:opacity-80"
        onPress={() => navigation.navigate('TestPrep')}>
        <View className="flex-row items-center rounded-full bg-indigo-600 px-5 py-3 shadow-lg shadow-indigo-600/30">
          <MaterialIcons name="menu-book" size={20} className="mr-2 text-white" />
          <Text className="text-sm font-semibold text-white">Test Prep</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        className="absolute left-6 top-20 z-10 rounded-full bg-gray-100 px-5 py-3 shadow-sm dark:bg-[#1E1E1E]"
        onPress={() => setShowSettings(true)}>
        <View className="flex-row items-center">
          <MaterialIcons name="settings" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">Settings</Text>
        </View>
      </TouchableOpacity>
      <View className="flex-1 items-center justify-center">
        <View className="h-72 w-72 items-center justify-center">
          {/* Wave Animation Circles */}
          {isRecording && (
            <>
              <Animated.View
                className="absolute h-full w-full rounded-full border-2 border-rose-400/30 dark:border-rose-700/30"
                style={{
                  transform: [
                    { scale: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                  ],
                  opacity: waveAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                }}
              />
              <Animated.View
                className="absolute h-full w-full rounded-full border-2 border-rose-400/40 dark:border-rose-700/40"
                style={{
                  transform: [
                    { scale: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                  ],
                  opacity: waveAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                }}
              />
              <Animated.View
                className="absolute h-full w-full rounded-full border-2 border-rose-400/50 dark:border-rose-700/50"
                style={{
                  transform: [
                    { scale: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                  ],
                  opacity: waveAnim3.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                }}
              />
            </>
          )}

          {/* Main Record Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleRecordPress}
              className={`h-64 w-64 items-center justify-center rounded-full ${
                isRecording ? 'bg-rose-500 dark:bg-rose-600' : 'bg-indigo-500 dark:bg-indigo-600'
              }`}
              activeOpacity={0.8}>
              {isRecording ? (
                <View className="h-12 w-12 rounded-md bg-white" />
              ) : (
                <Feather name="mic" size={48} color="white" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text className="mt-16 text-xl font-semibold text-gray-800 dark:text-gray-100">
          {isRecording ? 'Recording...' : 'Tap to Record'}
        </Text>

        <Text className="mt-4 max-w-xs text-center text-gray-500 dark:text-gray-400">
          {isRecording
            ? 'Press again to stop recording'
            : 'Hold your phone close to capture clear audio'}
        </Text>
      </View>
      {showSettings && (
        <SettingsPopUp
          onClose={() => {
            setShowSettings(!showSettings);
          }}
          visible={showSettings}
        />
      )}
      {showSubjectModal && (
        <SubjectSelectionModal
          visible={showSubjectModal}
          onClose={() => {
            setShowSubjectModal(false);
            setCurrentRecordingUri(null);
          }}
          onSubmit={onSubjectSelected}
        />
      )}
    </View>
  );
}
