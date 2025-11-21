import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, Plus, User as UserIcon, Edit2, Trash2, X, Check } from 'lucide-react';
import { 
  getForumPosts, 
  createForumPost, 
  likeForumPost, 
  addForumComment,
  updateForumPost,
  deleteForumPost,
  updateForumComment,
  deleteForumComment
} from '../services/api';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  editable?: boolean;
  updatedAt?: string | null;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  editable?: boolean;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());
  
  // Editing states
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await getForumPosts(0, 50);
      const data = res.data || [];
      
      const mapped: Post[] = data.map((p: any) => {
        const rawContent = p.content || '';
        let title = '';
        let content = '';

        // Split title and content based on double newline separator
        const separatorIndex = rawContent.indexOf('\n\n');

        if (separatorIndex !== -1) {
            title = rawContent.substring(0, separatorIndex);
            content = rawContent.substring(separatorIndex + 2);
        } else {
            // Fallback for older posts
            const firstLineIndex = rawContent.indexOf('\n');
            if (firstLineIndex !== -1) {
                title = rawContent.substring(0, firstLineIndex);
                content = rawContent.substring(firstLineIndex + 1);
            } else {
                title = rawContent;
                content = rawContent; 
            }
        }

        return {
            id: p.id,
            title: title.slice(0, 80),
            content: content,
            author: p.author || 'Unknown',
            createdAt: p.createdAt || new Date().toISOString(),
            likes: p.likeCount || 0,
            liked: !!p.likedByCurrentUser,
            editable: !!p.editable,
            comments: (p.comments || []).map((c: any) => ({
                id: c.id,
                content: c.content,
                author: c.author,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt || null,
                likes: c.likeCount || 0,
                editable: !!c.editable
            }))
        };
      });
      setPosts(mapped);
    } catch (err) {
      console.error('Failed to load forum posts', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Please write something to post');
      return;
    }
    try {
      const combined = newPostTitle ? `${newPostTitle}\n\n${newPostContent}` : newPostContent;
      await createForumPost(combined);
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
      await loadPosts();
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleLikePost = async (postId: number) => {
    // Optimistic update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked };
      }
      return post;
    }));
    try {
      await likeForumPost(postId);
      await loadPosts(); 
    } catch (err) {
      console.error('Failed to like post', err);
      await loadPosts(); // Revert
    }
  };

  const handleAddComment = async (postId: number) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) {
      alert('Please enter a comment');
      return;
    }
    try {
      await addForumComment(postId, commentContent);
      setCommentInputs({ ...commentInputs, [postId]: '' });
      await loadPosts();
      // Auto-expand comments to show the new one
      const newExpanded = new Set(expandedPosts);
      newExpanded.add(postId);
      setExpandedPosts(newExpanded);
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Failed to add comment. Please try again.');
    }
  };

  // --- Post Edit/Delete Handlers ---
  const handleUpdatePost = async (post: Post) => {
    try {
        const fullUpdate = `${post.title}\n\n${editingContent}`;
        await updateForumPost(post.id, fullUpdate);
        setEditingPostId(null);
        setEditingContent('');
        await loadPosts();
    } catch (err) {
        console.error('Failed to update post', err);
        alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
        await deleteForumPost(postId);
        await loadPosts();
    } catch (err) {
        console.error('Failed to delete post', err);
        alert('Failed to delete post');
    }
  };

  // --- Comment Edit/Delete Handlers ---
  const handleUpdateComment = async (commentId: number) => {
    try {
        await updateForumComment(commentId, editingCommentContent);
        setEditingCommentId(null);
        setEditingCommentContent('');
        await loadPosts();
    } catch (err) {
        console.error('Failed to update comment', err);
        alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
        await deleteForumComment(commentId);
        await loadPosts();
    } catch (err) {
        console.error('Failed to delete comment', err);
        alert('Failed to delete comment');
    }
  };

  const toggleComments = (postId: number) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Community Forum</h1>
        <p className="text-gray-600">Share tips, ask questions, and learn from the community</p>
      </div>

      {/* Create New Post Button */}
      <div className="mb-6">
        {!showNewPost ? (
          <button
            onClick={() => setShowNewPost(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all"
          >
            <Plus size={20} />
            Start a Discussion
          </button>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Post</h2>
            <input
              type="text"
              placeholder="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <textarea
              placeholder="What's on your mind? Share your financial tips or questions..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewPost(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <MessageSquare className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
            <p className="text-gray-500">Be the first to start a discussion!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-full">
                  <UserIcon className="text-blue-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{post.title}</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-gray-700">{post.author}</span>
                    <span>•</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                
                {/* FIXED: Explicit Edit/Delete Buttons for Posts */}
                {post.editable && editingPostId !== post.id && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingPostId(post.id); setEditingContent(post.content); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content or Edit Form */}
              {editingPostId === post.id ? (
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-blue-100">
                    <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                        rows={5}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingPostId(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                        <button onClick={() => handleUpdatePost(post)} className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded">Save Changes</button>
                    </div>
                </div>
              ) : (
                <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              )}

              {/* Like & Comment Count */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                    post.liked ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp size={18} fill={post.liked ? 'currentColor' : 'none'} />
                  <span className="font-medium">{post.likes}</span>
                </button>
                
                <button
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare size={18} />
                  <span className="font-medium">{post.comments.length} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              {expandedPosts.has(post.id) && (
                <div className="mt-4 pl-4 border-l-2 border-gray-100">
                  {/* Comment List */}
                  <div className="space-y-4 mb-4">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="group">
                        <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-800">{comment.author}</span>
                                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                                {comment.updatedAt && <span className="text-[10px] text-gray-400 italic">(edited)</span>}
                            </div>
                            
                            {/* FIXED: Always Visible Edit/Delete for Comments (Removed opacity logic) */}
                            {comment.editable && editingCommentId !== comment.id && (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}
                                        className="text-xs text-gray-400 hover:text-blue-600 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-xs text-gray-400 hover:text-red-600 font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                          </div>

                          {/* Comment Content or Edit Form */}
                          {editingCommentId === comment.id ? (
                              <div className="mt-1">
                                  <input
                                      value={editingCommentContent}
                                      onChange={(e) => setEditingCommentContent(e.target.value)}
                                      className="w-full p-2 text-sm border rounded mb-2"
                                      autoFocus
                                  />
                                  <div className="flex gap-2 text-xs">
                                      <button onClick={() => handleUpdateComment(comment.id)} className="text-blue-600 font-medium">Save</button>
                                      <button onClick={() => setEditingCommentId(null)} className="text-gray-500">Cancel</button>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-sm text-gray-700">{comment.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 relative">
                        <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        // FIXED: Replaced onKeyPress with onKeyDown
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="w-full py-2 px-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                        />
                        <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 disabled:text-gray-300 hover:text-blue-700 transition-colors"
                        >
                        <Send size={16} />
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;