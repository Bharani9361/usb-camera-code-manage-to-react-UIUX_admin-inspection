import React, { useState } from 'react';
import { Collapse, Button } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const TreeStructure = ( node ) => {
    return (
        <Collapse style={{ marginBottom: 8 }}>
            <Panel
                header={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {node.name}
                    <Button
                        icon={<PlusOutlined />}
                        style={{ border: 'none', background: 'transparent' }}
                        onClick={() => console.log(`Add operation for ${node.name}`)} />
                </div>}
                key={node.id}
            >
                {/* Recursively render children if available */}
                {node.children && node.children.length > 0 ? (
                    node.children.map((child) => (
                        <TreeStructure key={child.id} node={child} />
                    ))
                ) : (
                    <p style={{ marginLeft: 20 }}>No children</p>
                )}
            </Panel>
        </Collapse>
    );
};

const HierarchicalDisplay = () => {
    const [data, setData] = useState(
        [
            {
              id: 1,
              name: 'Parent 1',
              children: [
                {
                  id: 2,
                  name: 'Child 1.1',
                  children: [
                    { id: 4, name: 'Grandchild 1.1.1' },
                    { id: 5, name: 'Grandchild 1.1.2' }
                  ]
                },
                {
                  id: 3,
                  name: 'Child 1.2',
                  children: [
                    { id: 6, name: 'Grandchild 1.2.1' }
                  ]
                }
              ]
            },
            {
              id: 7,
              name: 'Parent 2',
              children: [
                {
                  id: 8,
                  name: 'Child 2.1',
                  children: [
                    { id: 9, name: 'Grandchild 2.1.1' }
                  ]
                }
              ]
            }
          ]          
    )
    return (
        <div>
            {data.map((parent) => (
                <TreeStructure key={parent.id} node={parent} />
            ))}
        </div>
    );
};

export default HierarchicalDisplay;
