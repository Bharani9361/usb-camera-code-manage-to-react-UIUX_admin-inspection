import React from 'react';
import { ToolOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import './SidebarTabs.css';

const SidebarTabs = () => (
  <div className="sidebar-tabs">
    <div className="tab">
      <ToolOutlined /> <span>Component Info</span>
    </div>
    <div className="tab">
      <TeamOutlined /> <span>Station Info</span>
    </div>
    <div className="tab">
      <FileTextOutlined /> <span>Station Report</span>
    </div>
  </div>
);

export default SidebarTabs;
