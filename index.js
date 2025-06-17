import React, { useEffect, useState } from 'react';
import {
  fetchLeaderboard,
  voteMeme,
  generateCaption,
  bidOnMeme,
} from '../services/api';
import { io } from 'socket.io-client';

// ✅ Connect to backend server via socket
const socket = io('http://localhost:5000');

const MemeGallery = () => {
  const [memes, setMemes] = useState([]);

  // 🔄 Fetch memes from backend (sorted by upvotes)
  const fetchMemes = async () => {
    try {
      const res = await fetchLeaderboard();
      setMemes(res.data);
    } catch (err) {
      console.error('Error fetching memes:', err);
    }
  };

  useEffect(() => {
    fetchMemes();

    // 🔔 Realtime update when someone votes or bids
    socket.on('bid_update', (data) => {
      console.log('📡 Bid updated:', data);
      fetchMemes(); // refresh memes
    });

    socket.on('vote_update', (data) => {
      console.log('📡 Vote updated:', data);
      fetchMemes();
    });

    // 🚿 Clean up listeners when component unmounts
    return () => {
      socket.off('bid_update');
      socket.off('vote_update');
    };
  }, []);

  // 👍👎 Handle upvote/downvote
  const handleVote = async (id, type) => {
    try {
      await voteMeme(id, type);
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  // ✨ Handle caption generation
  const handleCaption = async (id, tags) => {
    try {
      await generateCaption(id, tags);
    } catch (err) {
      console.error('Caption error:', err);
    }
  };

  // 💰 Handle placing bid
  const handleBid = async (id) => {
    try {
      await bidOnMeme(id, 10);
    } catch (err) {
      console.error('Bid error:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
      {memes.map((meme) => (
        <div
          key={meme.id}
          className="bg-[#1a1a1a] p-4 rounded-xl border border-purple-500 shadow-md"
        >
          <img
            src={meme.image_url}
            alt={meme.title}
            className="rounded mb-2 w-full h-48 object-cover"
          />
          <h3 className="text-white text-xl font-bold">{meme.title}</h3>
          <p className="text-sm text-pink-300">
            Tags: {meme.tags?.join(', ')}
          </p>
          <p className="text-sm text-yellow-300">
            Caption: {meme.caption || 'Not generated yet'}
          </p>
          <p className="text-sm text-green-400">
            Vibe: {meme.vibe || 'Not generated yet'}
          </p>
          <p className="text-white mt-2">🔥 Upvotes: {meme.upvotes}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleVote(meme.id, 'up')}
              className="bg-green-600 px-3 py-1 rounded"
            >
              👍
            </button>
            <button
              onClick={() => handleVote(meme.id, 'down')}
              className="bg-red-600 px-3 py-1 rounded"
            >
              👎
            </button>
          </div>

          <button
            onClick={() => handleCaption(meme.id, meme.tags)}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full"
          >
            ✨ Generate Caption
          </button>

          <button
            onClick={() => handleBid(meme.id)}
            className="mt-2 bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600 w-full"
          >
            💰 Place Bid (10 Credits)
          </button>
        </div>
      ))}
    </div>
  );
};

export default MemeGallery;
