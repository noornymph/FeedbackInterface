import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { format } from 'date-fns';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SlackIcon from '@mui/icons-material/AlternateEmail';

const FeedbackItem = ({ feedback }) => {
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
  
  return (
    <Card sx={{ mb: 2, borderLeft: '4px solid #1976d2' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            From: {feedback.sender.sender_username}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {format(new Date(feedback.timestamp), 'MMM d, yyyy h:mm a')}
          </Typography>
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
          {feedback.message}
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