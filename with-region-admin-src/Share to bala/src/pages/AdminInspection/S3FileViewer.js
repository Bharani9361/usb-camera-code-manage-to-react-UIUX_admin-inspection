import React from 'react';
import axios from 'axios';
import {
  ListGroup,
  ListGroupItem,
  Button,
  Spinner,
  Modal,
  ModalBody,
  ModalHeader
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class FileExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: {},
      expanded: {},
      loading: true,
      error: null,
      imageFiles: [],
      fileSizes: {}, // Map of fullPath -> size in bytes
      previewIndex: null,
      modalOpen: false
    };
  }

  componentDidMount() {
    const apiUrl = 'https://127.0.0.1:5010/list-files?folder=Vs_inspection';

    axios
      .get(apiUrl)
      .then(async (res) => {
        if (res.data && Array.isArray(res.data.files)) {
          const files = res.data.files.map(f => `/${f}`);
          const tree = this.buildTree(files);
          const imageFiles = files.filter((f) =>
            /\.(png|jpe?g|gif|bmp|webp)$/i.test(f)
          );
          const filePaths = files.filter(f => !f.endsWith('/'));

          // const fileSizes = await this.fetchFileSizes(filePaths);

          this.setState({ 
            treeData: tree, imageFiles, 
            // fileSizes, 
            loading: false });
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch((err) => {
        this.setState({ error: err.message, loading: false });
      });
  }

  // Fetch file sizes in parallel
  fetchFileSizes = async (paths) => {
    const sizeMap = {};
    const requests = paths.map(path =>
      axios
        .get(`https://127.0.0.1:5010/file-info?path=${encodeURIComponent(path)}`)
        .then((res) => {
          sizeMap[path] = res.data.size; // assuming { size: number }
        })
        .catch(() => {
          sizeMap[path] = null;
        })
    );
    await Promise.all(requests);
    return sizeMap;
  };

  formatSize = (bytes) => {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  buildTree = (paths) => {
    const root = {};
    paths.forEach((path) => {
      const parts = path.split('/').filter(Boolean);
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = i === parts.length - 1 && !path.endsWith('/')
            ? null
            : {};
        }
        current = current[part] ?? {};
      }
    });
    return root;
  };

  toggle = (path) => {
    this.setState((prev) => ({
      expanded: {
        ...prev.expanded,
        [path]: !prev.expanded[path]
      }
    }));
  };

  openPreview = (filePath) => {
    const { imageFiles } = this.state;
    const index = imageFiles.indexOf(filePath);
    if (index >= 0) {
      this.setState({ modalOpen: true, previewIndex: index });
    }
  };

  nextImage = () => {
    this.setState((prev) => ({
      previewIndex: (prev.previewIndex + 1) % prev.imageFiles.length
    }));
  };

  prevImage = () => {
    this.setState((prev) => ({
      previewIndex:
        (prev.previewIndex - 1 + prev.imageFiles.length) % prev.imageFiles.length
    }));
  };

  closeModal = () => {
    this.setState({ modalOpen: false, previewIndex: null });
  };

  renderTree = (node, parentPath = '') => {
    const { fileSizes } = this.state;

    return Object.entries(node).map(([key, value]) => {
      const fullPath = `${parentPath}/${key}`;
      const isFolder = value !== null;
      const isImage = !isFolder && /\.(png|jpe?g|gif|bmp|webp)$/i.test(key);
      const size = fileSizes[fullPath];
      const sizeLabel = size != null ? ` (${this.formatSize(size)})` : '';

      return (
        <ListGroupItem key={fullPath} className="pl-3 border-0">
          {isFolder ? (
            <div>
              <Button
                size="sm"
                color="link"
                onClick={() => this.toggle(fullPath)}
              >
                {this.state.expanded[fullPath] ? '📂' : '📁'} {key}
              </Button>
              {this.state.expanded[fullPath] && (
                <ListGroup className="ml-4">
                  {this.renderTree(value, fullPath)}
                </ListGroup>
              )}
            </div>
          ) : isImage ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              📄 {key}
              <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 5 }}>
                {sizeLabel}
              </span>
              <img
                src={`https://d16qxmwlgqc3es.cloudfront.net${fullPath}`}
                alt={key}
                onClick={() => this.openPreview(fullPath)}
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover',
                  marginLeft: '10px',
                  cursor: 'pointer',
                  border: '1px solid #ccc'
                }}
              />
            </div>
          ) : (
            <div>
              📄 {key}
              <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 5 }}>
                {sizeLabel}
              </span>
            </div>
          )}
        </ListGroupItem>
      );
    });
  };

  render() {
    const {
      treeData,
      loading,
      error,
      modalOpen,
      previewIndex,
      imageFiles
    } = this.state;

    const currentImage =
      previewIndex !== null ? imageFiles[previewIndex] : null;

    return (
      <div className="page-content">
        {loading ? (
          <div><Spinner color="primary" /> Loading files...</div>
        ) : error ? (
          <div className="text-danger">❌ Error: {error}</div>
        ) : (
          <>
            <h5>📁 File Explorer: Vs_inspection</h5>
            <ListGroup>{this.renderTree(treeData)}</ListGroup>
          </>
        )}

        {/* Preview Modal */}
        <Modal isOpen={modalOpen} toggle={this.closeModal} size="lg">
          <ModalHeader toggle={this.closeModal}>Image Preview</ModalHeader>
          <ModalBody className="text-center">
            {currentImage && (
              <div>
                <img
                  src={`https://d16qxmwlgqc3es.cloudfront.net${currentImage}`}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
                <div className="mt-3 d-flex justify-content-between">
                  <Button onClick={this.prevImage} color="secondary">⬅ Prev</Button>
                  <Button onClick={this.nextImage} color="secondary">Next ➡</Button>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default FileExplorer;


// import React from 'react';
// import axios from 'axios';
// import {
//     ListGroup,
//     ListGroupItem,
//     Button,
//     Spinner,
//     Modal,
//     ModalBody,
//     ModalHeader
// } from 'reactstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

// class FileExplorer extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             treeData: {},
//             expanded: {},
//             loading: true,
//             error: null,
//             imageFiles: [],
//             previewIndex: null,
//             modalOpen: false
//         };
//     }

//     componentDidMount() {
//         const apiUrl = 'https://127.0.0.1:5010/list-files?folder=Vs_inspection';

//         axios
//             .get(apiUrl)
//             .then((res) => {
//                 if (res.data && Array.isArray(res.data.files)) {
//                     const files = res.data.files.map(f => `/${f}`); // prefix `/` to match fullPath
//                     const tree = this.buildTree(files);
//                     const imageFiles = files.filter((f) =>
//                         /\.(png|jpe?g|gif|bmp|webp)$/i.test(f)
//                     );
//                     this.setState({ treeData: tree, imageFiles, loading: false });
//                 } else {
//                     throw new Error('Invalid response format');
//                 }
//             })
//             .catch((err) => {
//                 this.setState({ error: err.message, loading: false });
//             });
//     }

//     buildTree = (paths) => {
//         const root = {};
//         paths.forEach((path) => {
//             const parts = path.split('/').filter(Boolean);
//             let current = root;
//             for (let i = 0; i < parts.length; i++) {
//                 const part = parts[i];
//                 if (!current[part]) {
//                     current[part] = i === parts.length - 1 && !path.endsWith('/')
//                         ? null
//                         : {};
//                 }
//                 current = current[part] ?? {};
//             }
//         });
//         return root;
//     };

//     toggle = (path) => {
//         this.setState((prev) => ({
//             expanded: {
//                 ...prev.expanded,
//                 [path]: !prev.expanded[path]
//             }
//         }));
//     };

//     openPreview = (filePath) => {
//         const { imageFiles } = this.state;
//         const index = imageFiles.indexOf(filePath);
//         if (index >= 0) {
//             this.setState({ modalOpen: true, previewIndex: index });
//         }
//     };

//     nextImage = () => {
//         this.setState((prev) => ({
//             previewIndex: (prev.previewIndex + 1) % prev.imageFiles.length
//         }));
//     };

//     prevImage = () => {
//         this.setState((prev) => ({
//             previewIndex:
//                 (prev.previewIndex - 1 + prev.imageFiles.length) % prev.imageFiles.length
//         }));
//     };

//     closeModal = () => {
//         this.setState({ modalOpen: false, previewIndex: null });
//     };

//     renderTree = (node, parentPath = '') => {
//         return Object.entries(node).map(([key, value]) => {
//             const fullPath = `${parentPath}/${key}`;
//             const isFolder = value !== null;
//             const isImage = !isFolder && /\.(png|jpe?g|gif|bmp|webp)$/i.test(key);

//             return (
//                 <ListGroupItem key={fullPath} className="pl-3 border-0">
//                     {isFolder ? (
//                         <div>
//                             <Button
//                                 size="sm"
//                                 color="link"
//                                 onClick={() => this.toggle(fullPath)}
//                             >
//                                 {this.state.expanded[fullPath] ? '📂' : '📁'} {key}
//                             </Button>
//                             {this.state.expanded[fullPath] && (
//                                 <ListGroup className="ml-4">
//                                     {this.renderTree(value, fullPath)}
//                                 </ListGroup>
//                             )}
//                         </div>
//                     ) : isImage ? (
//                         <div style={{ display: 'flex', alignItems: 'center' }}>
//                             📄 {key}
//                             <img
//                                 src={`https://d16qxmwlgqc3es.cloudfront.net${fullPath}`}
//                                 alt={key}
//                                 onClick={() => this.openPreview(fullPath)}
//                                 style={{
//                                     width: '40px',
//                                     height: '40px',
//                                     objectFit: 'cover',
//                                     marginLeft: '10px',
//                                     cursor: 'pointer',
//                                     border: '1px solid #ccc'
//                                 }}
//                             />
//                         </div>
//                     ) : (
//                         <div>📄 {key}</div>
//                     )}
//                 </ListGroupItem>
//             );
//         });
//     };

//     render() {
//         const {
//             treeData,
//             loading,
//             error,
//             modalOpen,
//             previewIndex,
//             imageFiles
//         } = this.state;

//         const currentImage =
//             previewIndex !== null ? imageFiles[previewIndex] : null;

//         if (loading) {
//             return (
//                 <div className="p-3">
//                     <Spinner color="primary" /> Loading files...
//                 </div>
//             );
//         }

//         if (error) {
//             return <div className="text-danger p-3">❌ Error: {error}</div>;
//         }

//         return (
//             <div className="p-3">
//                 <h5>📁 File Explorer: Vs_inspection</h5>
//                 <ListGroup>{this.renderTree(treeData)}</ListGroup>

//                 {/* Preview Modal */}
//                 <Modal isOpen={modalOpen} toggle={this.closeModal} size="lg">
//                     <ModalHeader toggle={this.closeModal}>Image Preview</ModalHeader>
//                     <ModalBody className="text-center">
//                         {currentImage && (
//                             <div>
//                                 <img
//                                     src={`https://d16qxmwlgqc3es.cloudfront.net${currentImage}`}
//                                     alt="Preview"
//                                     style={{ maxWidth: '100%', maxHeight: '70vh' }}
//                                 />
//                                 <div className="mt-3 d-flex justify-content-between">
//                                     <Button onClick={this.prevImage} color="secondary">
//                                         ⬅ Prev
//                                     </Button>
//                                     <Button onClick={this.nextImage} color="secondary">
//                                         Next ➡
//                                     </Button>
//                                 </div>
//                             </div>
//                         )}
//                     </ModalBody>
//                 </Modal>
//             </div>
//         );
//     }
// }

// export default FileExplorer;

