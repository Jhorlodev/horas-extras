import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import InputForm from './components/InputForm';

export default function App() {
  return (
    <View style={styles.container}>
      <InputForm />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
 
});
