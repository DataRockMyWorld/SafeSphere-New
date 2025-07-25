import React from 'react';
import { Box, Card, CardContent, Grid, Divider } from '@mui/material';
import Typography from './Typography';

const TypographyGuide: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="display" sx={{ mb: 4 }}>
        Typography Guide
      </Typography>
      
      <Typography variant="bodyLarge" sx={{ mb: 4, color: 'text.secondary' }}>
        This guide demonstrates the standardized typography system using Inter font throughout the SafeSphere application.
      </Typography>

      <Grid container spacing={4}>
        {/* Display Text */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                Display Text
              </Typography>
              <Typography variant="display" sx={{ mb: 2 }}>
                Display Text (800 weight)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Used for hero sections and main headlines
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Headings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                Headings
              </Typography>
              <Typography variant="heading1" sx={{ mb: 1 }}>
                Heading 1 (700 weight)
              </Typography>
              <Typography variant="heading2" sx={{ mb: 1 }}>
                Heading 2 (700 weight)
              </Typography>
              <Typography variant="heading3" sx={{ mb: 1 }}>
                Heading 3 (600 weight)
              </Typography>
              <Typography variant="heading4" sx={{ mb: 1 }}>
                Heading 4 (600 weight)
              </Typography>
              <Typography variant="heading5" sx={{ mb: 2 }}>
                Heading 5 (600 weight)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Used for page titles, section headers, and card titles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Body Text */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                Body Text
              </Typography>
              <Typography variant="bodyLarge" sx={{ mb: 1 }}>
                Body Large (400 weight) - Used for important body text and descriptions
              </Typography>
              <Typography variant="body" sx={{ mb: 1 }}>
                Body (400 weight) - Standard body text for paragraphs and content
              </Typography>
              <Typography variant="bodySmall" sx={{ mb: 2 }}>
                Body Small (400 weight) - Used for secondary text and captions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Used for main content, descriptions, and readable text
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* UI Elements */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                UI Elements
              </Typography>
              <Typography variant="button" sx={{ mb: 1 }}>
                Button Text (600 weight)
              </Typography>
              <Typography variant="caption" sx={{ mb: 1 }}>
                Caption Text (400 weight)
              </Typography>
              <Typography variant="overline" sx={{ mb: 2 }}>
                Overline Text (500 weight)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Used for buttons, labels, and small UI elements
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Font Weights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                Font Weights
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body" sx={{ fontWeight: 300 }}>
                  Light (300) - Inter Light
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 400 }}>
                  Regular (400) - Inter Regular
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 500 }}>
                  Medium (500) - Inter Medium
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 600 }}>
                  SemiBold (600) - Inter SemiBold
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 700 }}>
                  Bold (700) - Inter Bold
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 800 }}>
                  ExtraBold (800) - Inter ExtraBold
                </Typography>
                <Typography variant="body" sx={{ fontWeight: 900 }}>
                  Black (900) - Inter Black
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Usage Examples */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="heading4" sx={{ mb: 2 }}>
                Usage Examples
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="heading3" sx={{ mb: 1 }}>
                  Page Title
                </Typography>
                <Typography variant="body" sx={{ mb: 2 }}>
                  This is how a typical page title should look with proper hierarchy and spacing.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="heading4" sx={{ mb: 1 }}>
                  Card Title
                </Typography>
                <Typography variant="bodySmall" sx={{ mb: 2 }}>
                  Card descriptions and secondary information should use smaller body text.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="bodyLarge" sx={{ mb: 1 }}>
                  Important Information
                </Typography>
                <Typography variant="body" sx={{ mb: 2 }}>
                  Regular content and descriptions should use standard body text for optimal readability.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TypographyGuide; 