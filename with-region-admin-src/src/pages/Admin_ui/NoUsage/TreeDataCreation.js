import React, { useState } from "react";
import { Tree, Button, Input, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { DirectoryTree } = Tree;

const TreeDataCreation = () => {
  const [treeData, setTreeData] = useState([
    {
      title: "Root",
      key: "0",
      children: [],
    },
  ]);

  const [selectedKey, setSelectedKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  console.log(treeData)

  const handleSelect = (keys) => {
    if (keys.length > 0) {
      setSelectedKey(keys[0]);
    }
  };

  const addChildNode = () => {
    if (!selectedKey) return;

    const addNode = (nodes) => {
      return nodes.map((node) => {
        if (node.key === selectedKey) {
          const newChild = {
            title: newNodeTitle || "New Node",
            key: `${node.key}-${node.children?.length || 0}`,
            children: [],
          };
          return {
            ...node,
            children: [...(node.children || []), newChild],
          };
        }
        if (node.children) {
          return {
            ...node,
            children: addNode(node.children),
          };
        }
        return node;
      });
    };

    setTreeData((prev) => addNode(prev));
    setIsModalOpen(false);
    setNewNodeTitle("");
  };

  return (
    <div>
      <DirectoryTree
        treeData={treeData}
        onSelect={handleSelect}
        defaultExpandAll
        showLine
      />

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        disabled={!selectedKey}
        style={{ marginTop: 16 }}
      >
        Add Child Node
      </Button>

      <Modal
        title="Add Child Node"
        open={isModalOpen}
        onOk={addChildNode}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input
          placeholder="Enter node title"
          value={newNodeTitle}
          onChange={(e) => setNewNodeTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default TreeDataCreation;
