import React from 'react';
import { Typography as MuiTypography, TypographyProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom typography variants with Inter font
const StyledTypography = styled(MuiTypography)(({ theme }) => ({
  fontFamily: '"Inter", sans-serif',
}));

interface CustomTypographyProps extends TypographyProps {
  variant?: 
    | 'display' 
    | 'heading1' 
    | 'heading2' 
    | 'heading3' 
    | 'heading4' 
    | 'heading5' 
    | 'bodyLarge' 
    | 'body' 
    | 'bodySmall' 
    | 'caption' 
    | 'button' 
    | 'overline'
    | TypographyProps['variant'];
}

const Typography: React.FC<CustomTypographyProps> = ({ 
  variant = 'body1', 
  children, 
  ...props 
}) => {
  // Map custom variants to MUI variants
  const getMuiVariant = (customVariant: string): TypographyProps['variant'] => {
    switch (customVariant) {
      case 'display':
        return 'h1';
      case 'heading1':
        return 'h2';
      case 'heading2':
        return 'h3';
      case 'heading3':
        return 'h4';
      case 'heading4':
        return 'h5';
      case 'heading5':
        return 'h6';
      case 'bodyLarge':
        return 'subtitle1';
      case 'body':
        return 'body1';
      case 'bodySmall':
        return 'body2';
      case 'caption':
        return 'caption';
      case 'button':
        return 'button';
      case 'overline':
        return 'overline';
      default:
        return variant as TypographyProps['variant'];
    }
  };

  return (
    <StyledTypography
      variant={getMuiVariant(variant as string)}
      {...props}
    >
      {children}
    </StyledTypography>
  );
};

export default Typography; 