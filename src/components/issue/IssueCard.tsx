import React from 'react';
import type{ Issue } from '../../types';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';
import styles from './IssueCard.module.css';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'in-progress':
        return styles.statusInProgress;
      case 'resolved':
        return styles.statusResolved;
      default:
        return styles.statusPending;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      pothole: 'Pothole',
      garbage: 'Garbage/Waste',
      sewage: 'Sewage Problem', 
      streetlight: 'Streetlight Issue',
      others: 'Others'
    };
    return labels[category] || category;
  };

  return (
    <div className={styles.card}>
      {/* Issue Photo */}
      {issue.photoURL && (
        <div className={styles.imageContainer}>
          <img src={issue.photoURL} alt="Issue" className={styles.image} />
        </div>
      )}
      
      {/* Card Content */}
      <div className={styles.content}>
        {/* Status Badge */}
        <div className={`${styles.status} ${getStatusColor(issue.status)}`}>
          {issue.status.replace('-', ' ')}
        </div>
        
        {/* Category */}
        <div className={styles.category}>
          <Tag size={16} />
          <span>{getCategoryLabel(issue.category)}</span>
        </div>
        
        {/* Description */}
        <p className={styles.description}>{issue.description}</p>
        
        {/* Location */}
        <div className={styles.location}>
          <MapPin size={16} />
          <span>
            {issue.location.address || 
             `${issue.location.latitude.toFixed(4)}, ${issue.location.longitude.toFixed(4)}`}
          </span>
        </div>
        
        {/* Date */}
        <div className={styles.date}>
          <Calendar size={16} />
          <span>Reported: {format(issue.timestamp, 'MMM dd, yyyy')}</span>
        </div>
        
        {/* Admin Notes (if any) */}
        {issue.adminNotes && (
          <div className={styles.adminNotes}>
            <strong>Admin Notes:</strong> {issue.adminNotes}
          </div>
        )}
        
        {/* Last Updated - Fix the undefined issue */}
        <div className={styles.updated}>
          Last updated: {format(issue.updatedAt || issue.timestamp, 'MMM dd, yyyy HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
