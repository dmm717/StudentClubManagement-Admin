import { Card } from 'antd';

/**
 * PageWrapper component to ensure consistent styling and prevent overflow
 */
const PageWrapper = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`page-wrapper animate-fade-in ${className}`}
      style={{
        maxWidth: '100%',
        overflowX: 'hidden',
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default PageWrapper;

