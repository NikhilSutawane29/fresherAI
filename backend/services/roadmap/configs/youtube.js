import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

const searchVideo = async (topic) => {
  try {
    // we search based on some particular query
    let query = `Virtual Code ${topic}`;
    let { data } = await axios.get(BASE_URL, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        part: "snippet",
        q: query, // we give those query which we want to search
        maxResults: 1,
        type: "video", // returns a video from youtube based on our query
      },
    });

    if (data.items.length > 0) {
      const video = data.items[0];

      if (video.snippet.channelTitle.toLowerCase().includes("virtual code")) {
        return {
          title: video.snippet.title,
          channel: video.snippet.channelTitle,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        };
      }
    }

    // General search from youtube
    query = `${topic} Tutorial`;
    
    ({ data } = await axios.get(BASE_URL, {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        part: "snippet",
        q: query, // we give those query which we want to search
        maxResults: 1,
        type: "video", // returns a video from youtube based on our query
      },
    }));

    if (data.items.length > 0) {
      const video = data.items[0];
      return {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      };
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default searchVideo;
