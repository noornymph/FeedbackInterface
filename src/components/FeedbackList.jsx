import { useState, useEffect } from 'react';
import { Box, Typography, Pagination, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getFeedbacks } from '../services/api';
import FeedbackItem from './FeedbackItem';

const FeedbackList = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadFeedbacks = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getFeedbacks(user.user_id, page);
        setFeedbacks(data.mentions);
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
      <Typography variant="h4" component="h1" gutterBottom>
        Your Feedback Mentions
      </Typography>
      
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
    </Box>
  );
};

export default FeedbackList;