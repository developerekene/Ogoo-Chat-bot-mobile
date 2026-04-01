import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { Send, Menu, Heart, Activity, Calendar, Mic } from 'lucide-react-native';

// Color Palette
const COLORS = {
  bg: '#120E21',
  card: '#1E1938',
  accent: '#9D8DF1',
  textMain: '#FFFFFF',
  textSub: '#A5A5A5',
  userBubble: '#6C5CE7',
  online: '#4CAF50'
};

export default function App() {
  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm Ogoo. How can I help you today?", fromUser: false }
  ]);
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // NEW: State to track focus
  const [isFocused, setIsFocused] = useState(false);

  // LOGIC: Hide dashboard if: 
  // 1. User has focused the input
  // 2. User has typed something
  // 3. There are more than 1 messages (the chat has started)
  const showDashboard = !isFocused && inputText.length === 0 && messages.length === 1;

  const sendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: inputText, fromUser: true };
    setMessages((prev) => [...prev, userMsg]);

    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

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
      setIsLoading(false);
    }
  };

  // RESTORED HEADER COMPONENT
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80' }}
          style={styles.avatarMini}
        />
        <View>
          <Text style={styles.headerTitle}>Ogoo</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.menuCircle}>
        <Menu color={COLORS.textMain} size={20} />
      </TouchableOpacity>
    </View>
  );

  const DashboardContent = () => {
    if (!showDashboard) return null;

    return (
      <View style={styles.dashboardContainer}>
        <View style={styles.welcomeHero}>
          <Text style={styles.welcomeTitle}>Welcome! 👋</Text>
          <Text style={styles.welcomeSub}>
            I'm Ogoo, your personal health companion. I'm here to help you track your vitals,
            manage your fitness plans, and answer any health questions you may have.
          </Text>

          {/* New Horizontal Action Buttons */}
          <View style={styles.heroActionRow}>
            <TouchableOpacity style={styles.heroButtonPrimary}>
              <Heart color="white" size={16} fill="white" style={{ marginRight: 8 }} />
              <Text style={styles.heroButtonText}>Liquid Intake</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.heroButtonSecondary}>
              <Calendar color={COLORS.accent} size={16} style={{ marginRight: 8 }} />
              <Text style={[styles.heroButtonText, { color: COLORS.accent }]}>Plan Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.vitalsCard}>
          <View style={styles.heartIconCircle}>
            <Heart color="#FF4B4B" fill="#FF4B4B" size={22} />
          </View>
          <View>
            <Text style={styles.cardHeader}>Check vitals</Text>
            <Text style={styles.cardSub}>Let's see how your heart is beating</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.smallCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#342E5E' }]}>
              <Activity color={COLORS.accent} size={20} />
            </View>
            <Text style={styles.smallCardText}>Daily activity</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#342E5E' }]}>
              <Calendar color={COLORS.accent} size={20} />
            </View>
            <Text style={styles.smallCardText}>View my plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<DashboardContent />}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.fromUser ? styles.userBubble : styles.ogooBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listPadding}
        ListFooterComponent={isLoading ? (
          <View style={[styles.bubble, styles.ogooBubble, styles.loadingBubble]}>
            <ActivityIndicator size="small" color={COLORS.accent} />
          </View>
        ) : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.micButton}>
              <Mic color={COLORS.textSub} size={20} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Reply to Ogoo..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              editable={!isLoading}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendButton, { opacity: (isLoading || !inputText.trim()) ? 0.5 : 1 }]}
              disabled={isLoading || !inputText.trim()}
            >
              <Send color="white" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarMini: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: COLORS.accent },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.online, marginRight: 6 },
  headerStatus: { fontSize: 11, color: COLORS.textSub, fontWeight: '500' },
  menuCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  dashboardContainer: { marginBottom: 25 },
  imageWrapper: { position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  welcomeImage: { width: '100%', height: 220 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18, 14, 33, 0.2)' },
  vitalsCard: {
    backgroundColor: COLORS.card,
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartIconCircle: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255, 75, 75, 0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardHeader: { fontSize: 17, fontWeight: '700', color: COLORS.textMain },
  cardSub: { fontSize: 13, color: COLORS.textSub, marginTop: 4 },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between' },
  smallCard: {
    backgroundColor: COLORS.card,
    width: '48%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'flex-start',
  },
  iconCircle: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  smallCardText: { fontWeight: '600', color: COLORS.textMain, fontSize: 14 },
  listPadding: { paddingHorizontal: 25, paddingBottom: 20 },
  bubble: { padding: 16, borderRadius: 20, marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.userBubble, borderBottomRightRadius: 4 },
  ogooBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
  bubbleText: { color: COLORS.textMain, fontSize: 15, lineHeight: 22 },
  loadingBubble: { width: 70, alignItems: 'center' },
  inputContainer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  inputWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 30,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#342E5E'
  },
  micButton: { paddingHorizontal: 12 },
  input: { flex: 1, color: COLORS.textMain, fontSize: 15, height: 40 },
  sendButton: {
    backgroundColor: COLORS.userBubble,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  welcomeTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  welcomeTitle: {
    color: COLORS.textMain,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  welcomeSub: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 25
  },
  // dashboardContainer: { 
  //   marginBottom: 25 
  // },
  welcomeHero: {
    backgroundColor: COLORS.card, // Lighter purple card
    padding: 24,
    borderRadius: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#342E5E',
  },
  // welcomeTitle: {
  //   color: COLORS.textMain,
  //   fontSize: 26,
  //   fontWeight: '800',
  //   marginBottom: 10,
  // },
  // welcomeSub: {
  //   color: COLORS.textSub,
  //   fontSize: 15,
  //   lineHeight: 22,
  //   fontWeight: '400',
  //   marginBottom: 20,
  // },
  heroActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.userBubble, // Vivid Purple
    paddingVertical: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.userBubble,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  heroButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  heroButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});