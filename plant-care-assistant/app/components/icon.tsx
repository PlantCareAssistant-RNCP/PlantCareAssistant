'use client';

import { FC, SVGProps } from 'react';
import React from 'react';

// Import manuel des icônes que tu as dans /assets/icons/
import ArrowRight from '@icons/arrow_right.svg';
import ArrowRightwhite from '@icons/arrow_right_white.svg';
import ArrowLeft from '@icons/arrow_left.svg';
import ArrowLeftwhite from '@icons/arrow_left_white.svg';
import Comment from '@icons/comment_icon.svg';
import Commentwhite from '@icons/comment_icon_white.svg';
import CommentBlack from '@icons/comment_icon_black.svg';
import Feed from '@icons/feed_icon.svg';
import Feedwhite from '@icons/feed_icon_white.svg';
import Home from '@icons/home_icon.svg';
import Homewhite from '@icons/home_icon_white.svg';
import Schedule from '@icons/schedule_icon.svg';
import Schedulewhite from '@icons/schedule_icon_white.svg';
import Search from '@icons/search_icon.svg';
import Searchwhite from '@icons/search_icon_white.svg';
import Dashboard from '@icons/dashboard_icon.svg';
import Dashboardwhite from '@icons/dashboard_icon_white.svg';
import Photo from '@icons/photo_icon.svg';
import Plant from '@icons/plant_icon.svg';

import ButtonCalendar from '@icons/button_calendar.svg';
import ButtonFeed from '@icons/button_feed.svg';
import ButtonIdentification from '@icons/button_identification.svg';
import ButtonPlant from '@icons/button_plant.svg';

const icons = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  comment: Comment,
  feed: Feed,
  home: Home,
  schedule: Schedule,
  search: Search,
  dashboard: Dashboard,
  photo: Photo,
  arrowLeftwhite: ArrowLeftwhite,
  arrowRightwhite: ArrowRightwhite,
  commentwhite: Commentwhite,
  feedwhite: Feedwhite,
  homewhite: Homewhite,
  schedulewhite: Schedulewhite,
  searchwhite: Searchwhite,
  dashboardwhite: Dashboardwhite,
  commentBlack: CommentBlack,
  plant: Plant,
  buttonCalendar: ButtonCalendar,
  buttonFeed: ButtonFeed,
  buttonIdentification: ButtonIdentification,
  buttonPlant: ButtonPlant
};

type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number; // Taille par défaut si width/height ne sont pas spécifiés
  width?: number; // Largeur personnalisée
  height?: number; // Hauteur personnalisée
  className?: string;
};

const Icon: FC<IconProps> = ({ name, size = 24, width, height, className = '' }) => {
  const SvgIcon = icons[name];

  return (
    <SvgIcon
      width={width || size} // Utilise width si spécifié, sinon size
      height={height || size} // Utilise height si spécifié, sinon size
      className={className}
    />
  );
};

export default Icon;
