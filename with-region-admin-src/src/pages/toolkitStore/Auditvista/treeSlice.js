import { createSlice } from '@reduxjs/toolkit';
import { changeNodeAtPath, addNodeUnderParent, getFlatDataFromTree, getNodeAtPath, removeNodeAtPath, getVisibleNodeCount } from 'react-sortable-tree';
import urlSocket from "../../helpers/urlSocket"
const getNodeKey = ({ treeIndex }) => treeIndex;

const treeSlice = createSlice({
    name: 'treeData',
    initialState: {
        treeData: [],
        crud: false,
        editcrud: false,
        crudStatus: 0,
        path: [],
        getNodeInfo: null,
        getCode: null,
        getTitle: null,
        type: null,
        id: null,
        parent: null,
        menuName: '',
        totalHLength: 0,
        mainToggle: false,
        nodeCount: 1,
        open: false,
        templateData: await JSON.parse(sessionStorage.getItem("EditData")),
        authUser: await JSON.parse(sessionStorage.getItem("authUser")),
        db_info: await JSON.parse(sessionStorage.getItem("db_info")),
        configdatacheckpoint: [],
        nodeChildren: [],
        mediaErrors: false,
        valueErrors: false,
    },
    reducers: {
        setTreeData: (state, action) => {
            state.treeData = action.payload;
        },
        setState: (state, action) => {
            Object.assign(state, action.payload);
        },
        setTotalHLength: (state, action) => {
            state.totalHLength = action.payload;
        },
        setMenuName: (state, action) => {
            state.menuName = action.payload;
        },
        setIsOpen: (state, action) => {
            state.open = action.payload;
        },
        setmediaErrors: (state, action) => {
            state.mediaErrors = action.payload;
        },
        setvalueErrors: (state, action) => {
            state.valueErrors = action.payload;
        },
    },
});

export const { setTreeData, setState, setTotalHLength, setMenuName, setIsOpen, setmediaErrors, setvalueErrors } = treeSlice.actions;


const saveTreeData = (treeData, totalHLength, state) => {
    return async dispatch => {
        try {
            const flatData = await saveHStructure(treeData);
            const userData = JSON.parse(sessionStorage.getItem("authUser")).user_data;
            const editData = JSON.parse(sessionStorage.getItem("EditData") || "{}");
            const response = await urlSocket.post("webmngtmplt/savecpstructure", {
                templateInfo: {
                    template_id: editData?._id,
                    flatData: flatData,
                    treeData: treeData,
                    checkpointlength: _.filter(flatData, { type: 2 }).length,
                    lastGeneratedId: totalHLength,
                },
                userInfo: {
                    encrypted_db_url: state.db_info?.encrypted_db_url,
                    created_by: userData?._id,
                    company_id: userData?.company_id,
                },
            });
            console.log(response,'response',treeData)
            if (response?.data?.response_code === 500) {
                dispatch(getDocuments(state))
            }

        } catch (error) {
            console.error("Error in saveTreeData:", error);
        }
    }
};



export const getDocuments = () => {
    return async dispatch => {
        const userData = JSON.parse(sessionStorage.getItem("authUser"))
        const EditData = JSON.parse(sessionStorage.getItem("EditData"))
        try {
            urlSocket.post("webmngtmplt/gettemplatestructure", {
                templateInfo: {
                    template_id: EditData?._id,
                    tmplatedBy: EditData?.tmplt_ctd_by,
                },
                userInfo: {
                    db_info: userData.db_info.encrypted_db_url,
                    created_by: userData.user_data._id,
                    company_id: userData.user_data.company_id,
                },
            })
                .then((response) => {
                    console.log(response,'response')
                    var FlatData = response.data.data.template_structure;
                    dispatch(setTreeData(FlatData))
                    dispatch(setTotalHLength(response.data.data.lastGeneratedId))
                    dispatch(setState({
                        nodeCount: getVisibleNodeCount({ treeData: FlatData })
                    }));
                })
                .catch((error) => {
                    //console.log(error, "catch1");
                });
        } catch (error) {
            //console.log("catch error", error);
        }
    }
}


const treeDataToFlat = (treeData) => {
    var flatData = getFlatDataFromTree({
        treeData: treeData,
        getNodeKey,
        ignoreCollapsed: false,
    });
    var explicitData = _.filter(flatData, (item) => {
        return item;
    });
    return explicitData;
};

const saveHStructure = (treeData) => {
    return new Promise((resolve, reject) => {
        try {
            const explicitData = treeDataToFlat(treeData);
            resolve(_.map(explicitData, 'node'))

        } catch (error) {
            reject(error)
        }
    })
};


export const addNode = (node, path, type) => (dispatch, getState) => {
    //console.log("createeee")
    const state = getState().treeData;
    if (!path || path.length === 0) {
        console.error("Path array is empty or undefined");
        return;
    }
    const getNodeInfo = getNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
    });

    if (!getNodeInfo) {
        console.error("Invalid path: getNodeInfo is null or undefined");
        return;
    }

    dispatch(setState({
        type,
        path: path,
        crud: true,
        editcrud: false,
        crudStatus: 1,
        title: getNodeInfo.node.title,
        getTitle: "",
        getSubTitle: "",
        getSubTitledd: "0",
        id: getNodeInfo.node.children ? getNodeInfo.node.children.length + 1 : getNodeInfo.node.id,
        parent: getNodeInfo.node.id,
        children: getNodeInfo.node.children || state.children || []
    }));
};

export const crudNode = (values) => (dispatch, getState) => {
    const state = getState().treeData;
    //console.log('state', state)
    const { treeData, menuName, totalHLength, crudStatus } = state;
    const authUser = JSON.parse(sessionStorage.getItem("authUser"))
    const templateData = JSON.parse(sessionStorage.getItem("EditData"))

    let updatedTreeData;
    console.log('crudStatus :>> ', crudStatus, state, values);

    switch (crudStatus) {

        case 0:
            const parentKey = state.path && state.path.length > 0 ? state.path[state.path.length - 1] : null;
            updatedTreeData = addNodeUnderParent({
                treeData,
                parentKey,
                expandParent: true,
                getNodeKey,
                newNode: {
                    company_id: authUser.client_info[0].company_id,
                    owner_id: authUser.user_data._id,
                    template_id: templateData._id,
                    document_id: state.totalHLength + 1,
                    parent_id: null,
                    document_type: "0",
                    checkpoint: values.title,
                    checkpoint_type_id: null,
                    checkpoint_type: null,
                    enable_addOptns: false,
                    checkpoint_options: [],
                    min_score: 0,
                    max_score: 0,
                    custom_tbx: [],
                    impact_level: null,
                    compl_type: [],
                    creator_remarks: [],
                    guideline: "",
                    guideline_image: [],
                    id: state.totalHLength === undefined ? 1 :state.totalHLength + 1,
                    parent: null,
                    title: values.title,
                    subtitle: "",
                    type: 0,

                },
                addAsFirstChild: state.addAsFirstChild,
            }).treeData;
            break;
        case 1:
            const newNode = {
                company_id: authUser.client_info[0].company_id,
                owner_id: authUser.user_data._id,
                template_id: templateData._id,
                document_id: state.totalHLength + 1,
                parent_id: state.parent,
                document_type: String(state.type),
                checkpoint: state.type === 0 ? values.title : values.checkpoint,
                checkpoint_type_id: state.type === 0 ? null : values.checkpoint_type_id,
                checkpoint_type: state.type === 0 ? null : values.checkpoint_type,
                enable_addOptns: state.type === 0 ? false : values.enable_addOptns,
                checkpoint_options: state.type === 0 ? [] : values.checkpoint_options,
                min_score: state.type === 0 ? 0 : values.min_score,
                max_score: state.type === 0 ? 0 : values.max_score,
                custom_tbx: state.type === 0 ? [] : values.custom_tbx,
                impact_level: state.type === 0 ? null : values.impact_level,
                compl_type: state.type === 0 ? [] : values.compl_type,
                creator_remarks: state.type === 0 ? "" : values.creator_remarks,
                guideline: state.type === 0 ? "" : values.guideline,
                guideline_image: state.type === 0 ? [] : values.guideline_image,
                id: state.totalHLength + 1,
                parent: state.parent,
                title: state.type === 0 ? values.title : values.checkpoint,
                subtitle: "",
                type: state.type,


                rule: state.type === 0 ? [] : values.rule,
                options: state.type === 0 ? [] : values.options,
                enable_validation: values.enable_validation,
                max_digits: values?.max_digits,
                max_decimal: values?.max_decimal,
                both_case: values?.both_case,
                only_negative: values?.only_negative,
                only_positive: values?.only_positive,
                unit_name: values?.unit_name,
                enable_notapplicable: values.enable_notapplicable,
                checkpoint_mand_status: values.checkpoint_mand_status






            };
            updatedTreeData = addNodeUnderParent({
                treeData,
                parentKey: state.path[state.path.length - 1],
                expandParent: true,
                getNodeKey,
                newNode,
                addAsFirstChild: state.addAsFirstChild,
            }).treeData;
            break;

        case 2:

            updatedTreeData = addNodeUnderParent({
                treeData,
                expandParent: true,
                getNodeKey,
                newNode: {
                    children: state.getNodeInfo.children,
                    company_id: state.getNodeInfo.company_id,
                    owner_id: state.getNodeInfo.owner_id,
                    template_id: state.getNodeInfo.template_id,
                    document_type: state.getNodeInfo.document_type,
                    document_id: state.getNodeInfo.document_id,
                    parent_id: state.getNodeInfo.parent_id,
                    checkpoint: state.menuName,
                    checkpoint_type_id: state.getNodeInfo.checkpoint_type_id,
                    checkpoint_type: state.getNodeInfo.checkpoint_type,
                    enable_addOptns: state.getNodeInfo.enable_addOptns,
                    checkpoint_options: state.getNodeInfo.checkpoint_options,
                    min_score: state.getNodeInfo.min_score,
                    max_score: state.getNodeInfo.max_score,
                    custom_tbx: state.getNodeInfo.custom_tbx,
                    impact_level: state.getNodeInfo.impact_level,
                    compl_type: state.getNodeInfo.compl_type,
                    creator_remarks: state.getNodeInfo.creator_remarks,
                    guideline: state.getNodeInfo.guideline,
                    guideline_image: state.getNodeInfo.guideline_image,
                    title: state.menuName,
                    subtitle: "",
                    id: state.getNodeInfo.id,
                    parent: state.getNodeInfo.parent,
                    type: state.getNodeInfo.type,



                    rule: state.type === 0 ? [] : values.rule,
                    options: state.type === 0 ? [] : values.options,
                    enable_validation: values.enable_validation,
                    max_digits: values?.max_digits,
                    max_decimal: values?.max_decimal,
                    both_case: values?.both_case,
                    only_negative: values?.only_negative,
                    only_positive: values?.only_positive,
                    unit_name: values?.unit_name,
                    enable_notapplicable: values.enable_notapplicable,
                    checkpoint_mand_status: values.checkpoint_mand_status

                },
                crud: false,
                editcrud: false,
                childToggle: false,
                mainToggle: false,
                addAsFirstChild: state.addAsFirstChild,
            }).treeData;
            break;


        case 3: {
            const parentPath = state.path.slice(0, -1);
            const siblingIndex = state.path[state.path.length - 1];
            const parentNodeInfo = parentPath.length > 0
                ? getNodeAtPath({ treeData, path: parentPath, getNodeKey })
                : null;
            const parentNode = parentNodeInfo ? parentNodeInfo.node : null;
            const newNode = {
                company_id: authUser.client_info[0].company_id,
                owner_id: authUser.user_data._id,
                template_id: templateData._id,
                document_id: totalHLength + 1,
                parent_id: state.parent,
                document_type: String(state.type),
                checkpoint: state.type === 0 ? values.title : values.checkpoint,
                checkpoint_type_id: state.type === 0 ? null : values.checkpoint_type_id,
                checkpoint_type: state.type === 0 ? null : values.checkpoint_type,
                enable_addOptns: state.type === 0 ? false : values.enable_addOptns,
                checkpoint_options: state.type === 0 ? [] : values.checkpoint_options,
                min_score: state.type === 0 ? 0 : values.min_score,
                max_score: state.type === 0 ? 0 : values.max_score,
                custom_tbx: state.type === 0 ? [] : values.custom_tbx,
                impact_level: state.type === 0 ? null : values.impact_level,
                compl_type: state.type === 0 ? [] : values.compl_type,
                creator_remarks: state.type === 0 ? "" : values.creator_remarks,
                guideline: state.type === 0 ? "" : values.guideline,
                guideline_image: state.type === 0 ? [] : values.guideline_image,
                id: totalHLength + 1,
                parent: state.parent,
                title: state.type === 0 ? values.title : values.checkpoint,
                subtitle: "",
                type: state.type,




                rule: state.type === 0 ? [] : values.rule,
                options: state.type === 0 ? [] : values.options,
                enable_validation: values.enable_validation,
                max_digits: values?.max_digits,
                max_decimal: values?.max_decimal,
                both_case: values?.both_case,
                only_negative: values?.only_negative,
                only_positive: values?.only_positive,
                unit_name: values?.unit_name,
                enable_notapplicable: values.enable_notapplicable,
                checkpoint_mand_status: values.checkpoint_mand_status

            };

            if (!parentNode) {
                updatedTreeData = [
                    ...treeData.slice(0, siblingIndex + 1),
                    newNode,
                    ...treeData.slice(siblingIndex + 1)
                ];
            } else {
                const newChildren = [...(parentNode.children || [])];
                newChildren.splice(siblingIndex + 1, 0, newNode);
                updatedTreeData = changeNodeAtPath({
                    treeData,
                    path: parentPath,
                    getNodeKey,
                    newNode: { ...parentNode, children: newChildren },
                });
            }
            break;
        }

        default:
            console.error("Invalid crudStatus value:", crudStatus);
            return;


    }
    dispatch(setTreeData(updatedTreeData));
    console.log(updatedTreeData,'updatedTreeData');
    dispatch(saveTreeData(updatedTreeData, crudStatus === 2 ? totalHLength : totalHLength === undefined ? 1 :totalHLength + 1, state))

    dispatch(setState({
        crud: false,
        editcrud: false,
        childToggle: false,
        mainToggle: false,
        dataLoaded: true,
        totalHLength: crudStatus === 2 ? totalHLength : totalHLength + 1,
    }));
};






export const editNode = (path, node) => (dispatch, getState) => {
    const state = getState().treeData;

    const getNodeInfo = getNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
    });

    dispatch(setState({
        crud: false,
        editcrud: true,
        crudStatus: 2,
        path: path,
        getNodeInfo: getNodeInfo.node,
        getCode: getNodeInfo.node.code,
        getTitle: getNodeInfo.node.title,
        type: getNodeInfo.node.type,
        id: getNodeInfo.node.id,
        parent: getNodeInfo.node.parent,
        menuName: node.title,
    }));
};

export const updateNode = () => (dispatch, getState) => {
    const state = getState().treeData;
    const { treeData, menuName, totalHLength, crudStatus } = state;

    let updatedTreeData;

    switch (crudStatus) {
        case 2:
            updatedTreeData = changeNodeAtPath({
                treeData,
                path: state.path,
                expandParent: true,
                getNodeKey,
                newNode: {
                    ...state.getNodeInfo,
                    title: menuName,
                },
            });
            break;

        default:
            console.error("Invalid crudStatus value:", crudStatus);
            return;
    }

    dispatch(setTreeData(updatedTreeData));
    dispatch(saveTreeData(updatedTreeData, totalHLength, state));

    dispatch(setState({
        crud: false,
        editcrud: false,
        childToggle: false,
        mainToggle: false,
        dataLoaded: true,
        totalHLength: crudStatus === 2 ? totalHLength : totalHLength + 1,
    }));
};

export const deleteNode = (node, path) => (dispatch, getState) => {
    var totalHLength = getState().treeData.totalHLength
    dispatch(setTreeData(removeNodeAtPath({
        treeData: getState().treeData.treeData,
        path,
        getNodeKey,
    })));
    dispatch(setState({ crud: false }))
    dispatch(saveTreeData(getState().treeData.treeData, totalHLength, getState().treeData))
};





export const addCheckpoint = (node, path, type) => (dispatch, getState) => {


    const state = getState().treeData;


    //console.log("state.configData.question_type_info",state.authUser.config_data)


    const getNodeInfo = getNodeAtPath({
        treeData: state.treeData,
        path,
        getNodeKey,
    });

    dispatch(setState({
        type,
        path: path,
        crud: false,
        editcrud: false,
        crudStatus: 1,
        title: getNodeInfo.node.title,
        getTitle: "",
        getSubTitle: "",
        getSubTitledd: "0",
        id: getNodeInfo.node.children ? getNodeInfo.node.children.length + 1 : getNodeInfo.node.id,
        parent: getNodeInfo.node.id,
        children: getNodeInfo.node.children || state.children || [],
        mode: "0",
        configdatacheckpoint: state.authUser.config_data.question_type_info,
    }));



}

export const addCheckPointUnderNode = (values, treeDataState) => {

    //console.log("values",values)

    return async (dispatch, getState) => {
        try {
            const state = getState().treeData;
            const store = require("../../store").default;

            //console.log("state",state,store)
            const treeData = state.treeData;
            const totalHLength = state.totalHLength;
            const parentKey = state.path && state.path.length > 0 ? state.path[state.path.length - 1] : null;

            const getNodeInfo = getNodeAtPath({
                treeData: state.treeData,
                path: state.path,
                getNodeKey,
            });
            const authUser = JSON.parse(sessionStorage.getItem("authUser"))
            const templateData = JSON.parse(sessionStorage.getItem("EditData"))

            //console.log("getNodeInfo",getNodeInfo)

            const maxValue = values.checkpoint_options?.reduce(
                (max, obj) => (obj.score > max ? obj.score : max),
                -Infinity
            );
            const minValue = values.checkpoint_options?.reduce(
                (min, obj) => (obj.score < min ? obj.score : min),
                Infinity
            );

            values["max_score"] = maxValue;
            values["min_score"] = minValue;

            const updatedTreeData = addNodeUnderParent({
                treeData,
                expandParent: true,
                parentKey,
                getNodeKey,
                newNode: {
                    company_id: authUser.client_info[0].company_id,
                    owner_id: authUser.user_data._id,
                    template_id: templateData._id,
                    document_id: state.totalHLength + 1,
                    parent_id: state.parent,
                    document_type: String(state.type),
                    checkpoint: values.checkpoint,
                    checkpoint_type_id: values.checkpoint_type_id,
                    checkpoint_type: values.checkpoint_type,
                    enable_addOptns: values.enable_addOptns,
                    checkpoint_options: values.checkpoint_options,
                    min_score: values.min_score,
                    max_score: values.max_score,
                    custom_tbx: values.custom_tbx,
                    impact_level: values.impact_level,
                    compl_type: values.compl_type,
                    creator_remarks: values.creator_remarks,
                    guideline: values.guideline,
                    guideline_image: values.guideline_image,
                    id: state.totalHLength + 1,
                    parent: state.parent,
                    title: values.checkpoint,
                    subtitle: "",
                    type: state.type,


                    rule: values.rule,
                    options: values.options,
                    enable_validation: values.enable_validation,
                    max_digits: values?.max_digits,
                    max_decimal: values?.max_decimal,
                    both_case: values?.both_case,
                    only_negative: values?.only_negative,
                    only_positive: values?.only_positive,
                    unit_name: values?.unit_name,
                    enable_notapplicable: values.enable_notapplicable,
                    checkpoint_mand_status: values.checkpoint_mand_status



                },
                crud: false,
                editcrud: false,
                childToggle: false,
                mainToggle: false,
                totalHLength: totalHLength + 1,
            }).treeData;
            dispatch(saveTreeData(updatedTreeData, totalHLength + 1, state));
        } catch (error) {
            //console.log(error,'error')
        }


    }
}


export const editCheckpointAtPath = (parameter) => {

    return async (dispatch, getState) => {
        var values = _.cloneDeep(parameter)
        const state = getState().treeData;
        //console.log(state,'state',values);
        const treeData = state.treeData;
        const totalHLength = state.totalHLength;
        const parentKey = state.path && state.path.length > 0 ? state.path[state.path.length - 1] : null;

        const maxValue = values.checkpoint_options?.reduce(
            (max, obj) => (obj.score > max ? obj.score : max),
            -Infinity
        );
        const minValue = values.checkpoint_options?.reduce(
            (min, obj) => (obj.score < min ? obj.score : min),
            Infinity
        );

        values["max_score"] = maxValue;
        values["min_score"] = minValue;


        const updatedTreeData = changeNodeAtPath({
            treeData,
            path: state.path,
            getNodeKey: getNodeKey,
            newNode: {
                children: [],
                company_id: values.company_id || state.getNodeInfo.company_id,
                owner_id: values.owner_id || state.getNodeInfo.owner_id,
                template_id: values.template_id || state.getNodeInfo.template_id,
                document_id: values.document_id || state.getNodeInfo.document_id,
                parent_id: values.parent_id || state.getNodeInfo.parent_id,
                document_type: values.document_type || state.getNodeInfo.document_type,
                checkpoint: values.checkpoint,
                checkpoint_type_id: values.checkpoint_type_id || state.getNodeInfo.checkpoint_type_id,
                checkpoint_type: values.checkpoint_type || state.getNodeInfo.checkpoint_type,
                enable_addOptns: values.enable_addOptns || state.getNodeInfo.enable_addOptns,
                checkpoint_options: values.checkpoint_options || state.getNodeInfo.checkpoint_options,
                min_score: values.min_score || state.getNodeInfo.min_score,
                max_score: values.max_score || state.getNodeInfo.max_score,
                custom_tbx: values.custom_tbx || state.getNodeInfo.custom_tbx,
                impact_level: values.impact_level || state.getNodeInfo.impact_level,
                compl_type: values.compl_type || state.getNodeInfo.compl_type,
                creator_remarks: values.creator_remarks || state.getNodeInfo.creator_remarks,
                guideline: values.guideline || state.getNodeInfo.guideline,
                guideline_image: values.guideline_image || state.getNodeInfo.guideline_image,
                id: values.id || state.getNodeInfo.id,
                parent: values.parent || state.getNodeInfo.parent,
                title: values.checkpoint || state.menuName,
                subtitle: "",
                type: state.type || state.getNodeInfo.type,

                rule: values.rule,
                options: values.options,
                enable_validation: values.enable_validation,
                max_digits: values?.max_digits,
                max_decimal: values?.max_decimal,
                both_case: values?.both_case,
                only_negative: values?.only_negative,
                only_positive: values?.only_positive,
                unit_name: values?.unit_name,
                enable_notapplicable: values.enable_notapplicable,
                checkpoint_mand_status: values.checkpoint_mand_status



            },
        });


        dispatch(saveTreeData(updatedTreeData, totalHLength, state));

    }
}








export const dndNode = (droppedNode) => async (dispatch, getState) => {
    try {
        const parentId = droppedNode.nextParentNode ? droppedNode.nextParentNode.id : null;

        const updatedTreeData = changeNodeAtPath({
            treeData: getState().treeData.treeData,
            path: droppedNode.path,
            getNodeKey: getNodeKey,
            newNode: {
                // parent: parentId,
                // id: droppedNode.node.id,
                // title: droppedNode.node.title,
                // subtitle: droppedNode.node.subtitle,
                // type: droppedNode.node.type,
                // children: droppedNode.node.children || [],
                company_id: droppedNode.node.company_id,
                owner_id: droppedNode.node.owner_id,
                template_id: droppedNode.node.template_id,
                document_id: droppedNode.node.document_id,
                parent_id: parentId,
                parent: parentId,
                document_type: droppedNode.node.document_type,
                checkpoint: droppedNode.node.checkpoint,
                checkpoint_type_id: droppedNode.node.checkpoint_type_id,
                checkpoint_type: droppedNode.node.checkpoint_type,
                enable_addOptns: droppedNode.node.enable_addOptns,
                checkpoint_options: droppedNode.node.checkpoint_options,
                min_score: droppedNode.node.min_score,
                max_score: droppedNode.node.max_score,
                custom_tbx: droppedNode.node.custom_tbx,
                impact_level: droppedNode.node.impact_level,
                compl_type: droppedNode.node.compl_type,
                creator_remarks: droppedNode.node.creator_remarks,
                guideline: droppedNode.node.guideline,
                guideline_image: droppedNode.node.guideline_image,
                id: droppedNode.node.id,
                title: droppedNode.node.title,
                subtitle: droppedNode.node.subtitle,
                type: droppedNode.node.type,
                children: droppedNode.node.children,


                rule: droppedNode.node.rule,
                options: droppedNode.node.options,
                enable_validation: droppedNode.node.enable_validation,
                max_digits: droppedNode.node?.max_digits,
                max_decimal: droppedNode.node?.max_decimal,
                both_case: droppedNode.node?.both_case,
                only_negative: droppedNode.node?.only_negative,
                only_positive: droppedNode.node?.only_positive,
                unit_name: droppedNode.node?.unit_name,
                enable_notapplicable: droppedNode.node.enable_notapplicable,
                checkpoint_mand_status: droppedNode.node.checkpoint_mand_status

            },
        });
        dispatch(setTreeData(updatedTreeData));
        await dispatch(saveTreeData(updatedTreeData, getState().treeData.totalHLength, getState().treeData));
    } catch (error) {
        console.error('Error occurred while performing DND operation:', error);
        throw error;
    }
};
export const getNodeData = (nodeData) => (dispatch, getState) => {
    const { type, title, children } = nodeData;
    dispatch(setState({
        getNodeInfo: nodeData,
        nodeChildren: nodeData.type === 2 ? [{ node: nodeData, parentNode: null }] : []
    }))

};

export const onTreeChange = (newTreeData, dispatch) => {
    dispatch(setTreeData(newTreeData));
    dispatch(setState({
        nodeCount: getVisibleNodeCount({ treeData: newTreeData })
    }));
};


export const updateTreeData = (state) => (state.treeData.treeData)
// export const treeDataSliceReducer = treeDataSlice.reducer;
export default treeSlice.reducer