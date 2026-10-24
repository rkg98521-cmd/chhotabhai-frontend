import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({
  title = 'ChhotaBhai | Premium Mobile Accessories',
  description = 'Shop premium back covers, tempered glass, and fast chargers for Apple, Samsung, OnePlus, and more.',
  keywords = 'mobile accessories, luxury phone cases, 9D tempered glass, fast chargers',
  ogImage,
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default Meta;
