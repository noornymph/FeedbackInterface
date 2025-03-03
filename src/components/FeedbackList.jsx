import { useState, useEffect } from 'react';
import { Box, Typography, Pagination, CircularProgress, Alert, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getFeedbacks, summarizeFeedback } from '../services/api';
import FeedbackItem from './FeedbackItem';
import ReactMarkdown from 'react-markdown';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getFeedbacks(user.user_id, page);
        
        // Sort feedbacks by timestamp in descending order (newest first)
        const sortedFeedbacks = [...data.mentions].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        setFeedbacks(sortedFeedbacks);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err);
        setError('Failed to load feedbacks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, [user, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSummarize = async () => {
    try {
      setSummaryLoading(true);
      const currentUsername = user?.username;

      const formattedFeedback = {
        username: currentUsername,
        feedback: feedbacks.map(f => ({
          message: f.message,
          sender: f.sender,
          timestamp: f.timestamp,
          reactions: f.reactions || []
        }))
      };
      
      const result = await summarizeFeedback(formattedFeedback);
      setSummary(result);
      setOpenSummary(true);
    } catch (err) {
      console.error('Failed to summarize feedback:', err);
      setError('Failed to summarize feedback. Please try again later.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const SummaryDialog = () => (
    <Dialog 
      open={openSummary} 
      onClose={() => setOpenSummary(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Feedback Summary</DialogTitle>
      <DialogContent>
        {summary && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Based on {summary.feedback_count} feedback items
            </Typography>
            <Box sx={{ mt: 2 }}>
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Feedback Mentions
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: 'text.secondary' }}>
            # shoutouts
          </Typography>
        </div>
        {feedbacks.length > 0 && (
          <Button 
            variant="contained" 
            onClick={handleSummarize}
            disabled={summaryLoading}
          >
            {summaryLoading ? 'Summarizing...' : 'Summarize Feedback'}
          </Button>
        )}
      </Box>
      
      {feedbacks.length === 0 ? (
        <Alert severity="info">You don't have any feedback mentions yet.</Alert>
      ) : (
        <>
          {feedbacks.map((feedback, index) => (
            <FeedbackItem key={index} feedback={feedback} />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
      
      <SummaryDialog />
    </Box>
  );
};

export default FeedbackList;