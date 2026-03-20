import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send } from 'lucide-react-native';

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm Ogoo. How can I help you today?", fromUser: false }
  ]);
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <--- New Loading State
  
  // Create a reference to the list to allow auto-scrolling

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return; 

    const userMsg = { id: Date.now().toString(), text: inputText, fromUser: true };
    setMessages((prev) => [...prev, userMsg]);
    
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true); // <--- Start loading when request starts

    try {
      const response = await fetch('https://ogoo-backend.vercel.app/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();
      
      const ogooMsg = { id: (Date.now() + 1).toString(), text: data.reply, fromUser: false };
      setMessages((prev) => [...prev, ogooMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        id: 'error', 
        text: "I'm having trouble connecting to my brain. Check your internet?", 
        fromUser: false 
      }]);
    } finally {
      setIsLoading(false); // <--- Stop loading regardless of success/fail
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ogoo</Text>
        <Text style={styles.headerStatus}>{isLoading ? 'Typing...' : 'Online'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromUser ? styles.userBubble : styles.ogooBubble]}>
            <Text style={item.fromUser ? styles.userText : styles.ogooText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listPadding}
        ListFooterComponent={isLoading ? (
          <View style={[styles.bubble, styles.ogooBubble, styles.loadingBubble]}>
             <ActivityIndicator size="small" color="#555" />
          </View>
        ) : null}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading} // Disable input while Ogoo is thinking
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[styles.sendButton, { opacity: isLoading ? 0.5 : 1 }]}
            disabled={isLoading}
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { 
    paddingTop: 60, 
    paddingBottom: 15, 
    backgroundColor: '#FFF', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A' },
  headerStatus: { fontSize: 12, color: '#4CAF50', marginTop: 2 },
  listPadding: { padding: 20, paddingBottom: 40 },
  bubble: { padding: 14, borderRadius: 22, marginBottom: 12, maxWidth: '85%' },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#007AFF', 
    borderBottomRightRadius: 4 
  },
  ogooBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#E9E9EB', 
    borderBottomLeftRadius: 4 
  },
  loadingBubble: { width: 60, alignItems: 'center' },
  userText: { color: '#FFF', fontSize: 16, lineHeight: 22 },
  ogooText: { color: '#1C1C1E', fontSize: 16, lineHeight: 22 },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 15, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 15, 
    backgroundColor: '#FFF', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  input: { 
    flex: 1, 
    height: 48, 
    backgroundColor: '#F2F2F7', 
    borderRadius: 24, 
    paddingHorizontal: 18, 
    marginRight: 10,
    fontSize: 16
  },
  sendButton: { 
    backgroundColor: '#007AFF', 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});