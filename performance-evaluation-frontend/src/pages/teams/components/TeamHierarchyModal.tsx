import React, { useState, useEffect } from 'react';
import { X, Network, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { TeamHierarchyDto } from '@/types';
import { teamService } from '@/services/teamService';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button/Button';
import { Card } from '@/components/ui/layout/Card';
import { Badge } from '@/components/ui/feedback/Badge';

interface TeamHierarchyModalProps {
  onClose: () => void;
}

interface HierarchyNodeProps {
  node: TeamHierarchyDto;
  level: number;
  expandedNodes: Set<number>;
  onToggleNode: (nodeId: number) => void;
}

const HierarchyNode: React.FC<HierarchyNodeProps> = ({
  node,
  level,
  expandedNodes,
  onToggleNode,
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center space-x-3 p-3 rounded-lg border ${
          level === 0 ? 'bg-blue-50 border-blue-200' : 
          level === 1 ? 'bg-green-50 border-green-200' : 
          'bg-gray-50 border-gray-200'
        }`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => onToggleNode(node.id)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex-shrink-0">
          <Users className={`h-5 w-5 ${
            level === 0 ? 'text-blue-600' : 
            level === 1 ? 'text-green-600' : 
            'text-gray-600'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {node.name}
            </h4>
            <Badge 
              variant={node.isActive ? 'success' : 'danger'} 
              size="sm"
            >
              {node.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 truncate">{node.description}</p>
        </div>
        
        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-medium text-gray-900">{node.memberCount}</div>
          <div className="text-xs text-gray-500">members</div>
        </div>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-2">
          {node.children.map(child => (
            <HierarchyNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggleNode={onToggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TeamHierarchyModal: React.FC<TeamHierarchyModalProps> = ({
  onClose,
}) => {
  const [hierarchy, setHierarchy] = useState<TeamHierarchyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const { showNotification } = useUIStore();

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamHierarchy();
      setHierarchy(data);
      
      // Auto-expand top-level nodes
      const topLevelIds = new Set(data.map(node => node.id));
      setExpandedNodes(topLevelIds);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load team hierarchy',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNode = (nodeId: number) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (newExpandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
    }
    setExpandedNodes(newExpandedNodes);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (nodes: TeamHierarchyDto[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(hierarchy);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getTotalTeams = (nodes: TeamHierarchyDto[]): number => {
    return nodes.reduce((total, node) => {
      return total + 1 + (node.children ? getTotalTeams(node.children) : 0);
    }, 0);
  };

  const getTotalMembers = (nodes: TeamHierarchyDto[]): number => {
    return nodes.reduce((total, node) => {
      return total + node.memberCount + (node.children ? getTotalMembers(node.children) : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Network className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Team Hierarchy
              </h2>
              <p className="text-sm text-gray-500">
                Organizational structure and team relationships
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotalTeams(hierarchy)}
                </div>
                <div className="text-sm text-gray-500">Total Teams</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getTotalMembers(hierarchy)}
                </div>
                <div className="text-sm text-gray-500">Total Members</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {hierarchy.length}
                </div>
                <div className="text-sm text-gray-500">Top-Level Teams</div>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={expandAll}
              >
                Expand All
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Top Level</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Sub Teams</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-600 rounded"></div>
                <span>Child Teams</span>
              </div>
            </div>
          </div>

          {/* Hierarchy Tree */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading hierarchy...</div>
            </div>
          ) : (
            <Card>
              <div className="p-4">
                {hierarchy.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No teams found. Create some teams to see the hierarchy.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hierarchy.map(node => (
                      <HierarchyNode
                        key={node.id}
                        node={node}
                        level={0}
                        expandedNodes={expandedNodes}
                        onToggleNode={handleToggleNode}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
