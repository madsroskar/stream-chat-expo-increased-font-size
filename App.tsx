import { StyleSheet, Text, View } from "react-native";
import {
  Channel,
  Chat,
  DeepPartial,
  MessageInput,
  MessageList,
  OverlayProvider,
  Theme,
} from "stream-chat-expo";
import { StreamChat, Channel as ChannelType } from "stream-chat";
import { useEffect, useState } from "react";

const STREAM_API_KEY = "YOUR API KEY";
const STREAM_USER_ID = "YOUR CHAT USER ID";
const STREAM_USER_TOKEN = "YOUR CHAT USER TOKEN (JWT)";

const chatClient = StreamChat.getInstance(STREAM_API_KEY);

const user = {
  id: STREAM_USER_ID,
};

const channelFilter = {
  members: { $in: [user.id] },
};

const useStreamChat = () => {
  const [clientIsReady, setClientIsReady] = useState(false);
  const [channel, setChannel] = useState<ChannelType | null>(null);

  useEffect(() => {
    const setupClient = async () => {
      try {
        await chatClient.connectUser(user, STREAM_USER_TOKEN);

        setClientIsReady(true);
      } catch (error) {
        console.error(`Error connecting a user to Stream Chat: ${error}`);
      }
    };

    const userIsConnected = chatClient.userID !== undefined;
    if (!userIsConnected) {
      setupClient();
    }
  }, []);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const channels = await chatClient.queryChannels(
          channelFilter,
          { last_message_at: -1 },
          { limit: 1, watch: true }
        );

        setChannel(channels[0] ?? null);
      } catch (error) {
        console.error(`Error fetching a Stream Chat channel for user ${user}`);
      }
    };

    if (clientIsReady) {
      fetchChannel();
    }
  }, [clientIsReady]);

  return { clientIsReady, channel };
};

const customTheme: DeepPartial<Theme> = {
  messageSimple: {
    content: {
      markdown: {
        text: {
          fontSize: 28,
        },
      },
    },
  },
};

export default function App() {
  const { clientIsReady, channel } = useStreamChat();

  if (!clientIsReady || channel === null) {
    return <LoadingScreen />;
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient} style={customTheme}>
        <ChannelScreen channel={channel} />
      </Chat>
    </OverlayProvider>
  );
}

const LoadingScreen = () => (
  <View style={StyleSheet.absoluteFill}>
    <Text>Loading chat</Text>
  </View>
);

interface ChannelScreenProps {
  channel: ChannelType;
}

const ChannelScreen = (props: ChannelScreenProps) => {
  return (
    <Channel channel={props.channel}>
      <MessageList />
      <MessageInput />
    </Channel>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
