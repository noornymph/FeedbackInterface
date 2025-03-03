import { useState, useEffect } from 'react';
import { Box, Typography, Pagination, CircularProgress, Alert, Button, Dialog, DialogContent, DialogTitle, DialogActions, Fade } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { getFeedbacks, summarizeFeedback } from '../services/api';
import FeedbackItem from './FeedbackItem';
import ReactMarkdown from 'react-markdown';
import { BoltRounded as LightningIcon } from '@mui/icons-material';
import React from 'react';

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

  const SummaryDialog = () => {
    const [displayContent, setDisplayContent] = React.useState('loading');
    
    React.useEffect(() => {
      if (summaryLoading) {
        setDisplayContent('loading');
      } else if (summary) {
        setDisplayContent('summary');
      }
    }, [summaryLoading, summary]);

    return (
      <Dialog 
        open={openSummary || summaryLoading}
        onClose={() => !summaryLoading && setOpenSummary(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minWidth: '600px',
            minHeight: '700px',
            maxHeight: '90vh',
            height: 'auto'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">
            Feedback Summary
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ flex: 1 }}>
          <Box sx={{ 
            minHeight: '600px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Fade 
              in={displayContent === 'loading'} 
              timeout={{
                enter: 400,
                exit: 200
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
              }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Analyzing your feedback...
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  Please wait while we generate insights from your feedback
                </Typography>
              </Box>
            </Fade>

            <Fade 
              in={displayContent === 'summary'} 
              timeout={{
                enter: 400,
                exit: 200
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowY: 'auto',
                py: 3,
                px: 2,
                '& > *': { maxWidth: '100%' }
              }}>
                {summary && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Based on {summary.feedback_count} feedback items
                    </Typography>
                    <Box sx={{ 
                      mt: 2,
                      '& p, & ul, & ol': { 
                        mb: 2
                      }
                    }}>
                      <ReactMarkdown>{summary.summary}</ReactMarkdown>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Box>
        </DialogContent>
        <Fade 
          in={displayContent === 'summary'}
          timeout={{
            enter: 400,
            exit: 200
          }}
        >
          <DialogActions>
            <Button onClick={() => setOpenSummary(false)}>
              Close
            </Button>
          </DialogActions>
        </Fade>
      </Dialog>
    );
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
            startIcon={<LightningIcon sx={{ fontSize: 22 }} />}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              borderRadius: '8px',
              border: 0,
              color: 'white',
              height: 42,
              padding: '0 20px',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              textTransform: 'none',
              fontSize: '17px',
              fontWeight: 400,
              minWidth: 'auto',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0FBFE9 90%)',
                boxShadow: '0 4px 6px 2px rgba(33, 203, 243, .4)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out',
              },
              '&:disabled': {
                background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                boxShadow: 'none',
              }
            }}
          >
            Summarize
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