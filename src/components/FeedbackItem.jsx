import { Card, CardContent, Typography, Box, Chip, Avatar, IconButton, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SlackIcon from '@mui/icons-material/AlternateEmail';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';

const FeedbackItem = ({ feedback }) => {
  const [tooltipTitle, setTooltipTitle] = useState("Copy message");
  
  // Keywords to check for thumbs-up related reactions
  const thumbsUpKeywords = ["thumbsup", "+1", "plusone", "plus1", "thumbs-up"];
  
  // Count reactions that contain any of the keywords
  const endorsementCount = feedback.reactions?.reduce(
    (count, reaction) =>
      thumbsUpKeywords.some((keyword) => 
        reaction.reaction.toLowerCase().includes(keyword.toLowerCase()))
        ? count + 1
        : count,
    0
  ) || 0;
  
  // Add endorsement count to feedback object
  feedback.endorsements = endorsementCount;
  
  // Check if source is slack
  const isSlackSource = feedback.source?.toLowerCase() === 'slack';
  
  // Format sender name: capitalize first letters and replace dot with space
  const formatSenderName = (name) => {
    if (!name) return '';
    
    return name
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };
  
  const formattedSenderName = formatSenderName(feedback.sender.sender_username);
  
  // Format message to make mentioned users bold
  const formatMessage = (message) => {
    if (!message) return '';
    
    const parts = message.split(/(\s+)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span 
            key={index}
            style={{
              color: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              padding: '2px 4px',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  const formattedMessage = formatMessage(feedback.message);
  
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(feedback.message);
      setTooltipTitle("Copied!");
      setTimeout(() => {
        setTooltipTitle("Copy message");
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Card sx={{ mb: 2, borderLeft: '4px solid #1976d2' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            From: {formattedSenderName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(feedback.timestamp), 'MMM d, yyyy h:mm a')}
            </Typography>
            <Tooltip title={tooltipTitle}>
              <IconButton 
                onClick={handleCopyClick}
                size="small"
                sx={{ 
                  padding: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.08)'
                  }
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {feedback.source && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            {isSlackSource && <SlackIcon fontSize="small" color="action" />}
            <Typography variant="body2" color="text.secondary">
              Source: {feedback.source}
            </Typography>
          </Box>
        )}
        
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {formattedMessage}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
          <ThumbUpIcon fontSize="small" color={endorsementCount > 0 ? "primary" : "disabled"} />
          <Typography 
            variant="body2" 
            color={endorsementCount > 0 ? "primary.main" : "text.secondary"} 
            fontWeight={endorsementCount > 0 ? "medium" : "normal"}
          >
            {endorsementCount} {endorsementCount === 1 ? 'Endorsement' : 'Endorsements'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FeedbackItem;