import { Card, CardContent, Typography, Box, Chip, Avatar } from '@mui/material';
import { format } from 'date-fns';

const FeedbackItem = ({ feedback }) => {
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
        
        <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
          {feedback.message}
        </Typography>
        
        {feedback.reactions && feedback.reactions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {feedback.reactions.map((reaction, index) => (
              <Chip 
                key={index}
                label={`:${reaction.reaction}:`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackItem;