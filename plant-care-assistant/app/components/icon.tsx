'use client';

import { FC, SVGProps } from 'react';

// Import manuel des icônes que tu as dans /assets/icons/
import ArrowLeft from '@/assets/icons/arrow_left.svg';
import ArrowRight from '@/assets/icons/arrow_right.svg';
import Comment from '@/assets/icons/comment_icon.svg';
import Feed from '@/assets/icons/feed_icon.svg';
import Home from '@/assets/icons/home_icon.svg';
import Schedule from '@/assets/icons/schedule_icon.svg';
import Search from '@/assets/icons/search_icon.svg';
import React from 'react';



const icons = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  comment: Comment,
  feed: Feed,
  home: Home,
  schedule: Schedule,
  search: Search
};

type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

const Icon: FC<IconProps> = ({ name, size = 24, className }) => {
  const SvgIcon = icons[name];

  return <SvgIcon width={size} height={size} className={className} />;
};

export default Icon;
