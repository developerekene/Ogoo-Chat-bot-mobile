import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Send } from 'lucide-react-native';

export default function App() {
  // 1. Storage for our conversation
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm Ogoo. How can I help you today?", fromUser: false }
  ]);
  
  // 2. Storage for what the user is typing
  const [inputText, setInputText] = useState('');

  // 3. The Function to talk to your Vercel Backend
  const sendMessage = async () => {
    if (inputText.trim() === '') return; // Don't send empty messages

    const userMsg = { id: Date.now().toString(), text: inputText, fromUser: true };
    setMessages((prev) => [...prev, userMsg]); // Add user message to screen
    const currentInput = inputText;
    setInputText(''); // Clear the input box

    try {
      // CHANGE THIS URL to your actual Vercel Production URL
      const response = await fetch('https://ogoo-backend.vercel.app/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();
      
      // Add Ogoo's reply to the screen
      const ogooMsg = { id: (Date.now() + 1).toString(), text: data.reply, fromUser: false };
      setMessages((prev) => [...prev, ogooMsg]);
    } catch (error) {
      console.error("Connection Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ogoo</Text>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromUser ? styles.userBubble : styles.ogooBubble]}>
            <Text style={item.fromUser ? styles.userText : styles.ogooText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listPadding}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: { paddingHeight: 100, paddingTop: 60, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  listPadding: { padding: 20 },
  bubble: { padding: 12, borderRadius: 20, marginBottom: 10, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  ogooBubble: { alignSelf: 'flex-start', backgroundColor: '#E9E9EB' },
  userText: { color: '#FFF' },
  ogooText: { color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 20, backgroundColor: '#FFF', alignItems: 'center' },
  input: { flex: 1, height: 45, backgroundColor: '#F0F0F0', borderRadius: 25, paddingHorizontal: 20, marginRight: 10 },
  sendButton: { backgroundColor: '#007AFF', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});