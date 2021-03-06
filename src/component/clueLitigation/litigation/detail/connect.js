import { connect } from 'react-redux'
import LawsuitsDetail from './index'
import { actionCreator, union, getName } from '../../../../utils/util'
import { injectIntl } from 'react-intl'
import { message } from 'antd'
import api from '../../../../api/index';
import {
    GET_LAW_SUIT_DETAIL_SUCCESS, GET_DEFENDANT_INFO_SUCCESS, GET_LAW_SUIT_PROCESS_SUCCESS, GET_LAW_SUIT_LOGS_SUCCESS, UPDATE_LAW_SUIT_PROCESS_SUCCESS, UPDATE_DEFENDANT_INFO_SUCCESS, GET_LAW_SUIT_COOPERATIVE_LAWYER_SUCCESS, GET_LAW_SUIT_COOPERATIVE_LAWYER_ERROR, UPDATE_LAW_SUIT_DETAIL_SUCCESS
} from '../../../../contants/litigation/lawsuitDetailTypes';
import { UPDATE_LITIGATION_ALLOT_LIST_SUCCESS } from '../../../../contants/litigation/litigationTypes'
function mapStateToProps(state, props) {
    const { threadMainBodyType=[], litigationCloseCaseWay=[], litigationDocumentType=[], litigationAttributes=[], ligiationStatus = [] } = state.commonReducer
    const { parties, process, logs, suitCaseDetail, cooperativeLawyerList = [], minPageNo, minToltal } = state.lawsuitDetailReducer;
    const { oldLigiationList, newLigiationList } = state.ligitaionReducer
    const ligitaionList = union(oldLigiationList, newLigiationList)
    let result = JSON.stringify(process);
    return {
        ligitaionList,
        parties,
        process: JSON.parse(result),
        logs,
        suitCaseDetail,
        cooperativeLawyerList,
        minPageNo,
        minToltal,
        threadMainBodyType,
        litigationCloseCaseWay,
        litigationDocumentType,
        litigationAttributes,
        ligiationStatus
    }
}

function mapDispatchToProps(dispatch, props) {
    return {
        getSuitCaseDetail: (data, callback) => {
            api.getSuitDetail(data).then(res => {
                if (res.success) {
                    let dataObject = res.dataObject
                    if(dataObject.lawyerClueInfoDO.fileUrl){
                        dataObject.lawyerClueInfoDO.fileUrl = JSON.parse(dataObject.lawyerClueInfoDO.fileUrl)
                    }
                    dispatch(actionCreator(GET_LAW_SUIT_DETAIL_SUCCESS, { suitCaseDetail: dataObject }))
                    typeof callback === 'function' && callback(dataObject.id)
                } else {
                    dispatch(actionCreator(GET_LAW_SUIT_DETAIL_SUCCESS, { suitCaseDetail: {} }))
                    message.info(res.msg)
                }
            })
        },
        // 查询对方当事人信息
        getDefendantInfo: (data, callback) => {
            api.getDefendantInfo(data).then(res => {
                let result = [];
                if (res.success) {
                    if(res.module){
                        for (let i = 0; i < res.module.length; i++) {
                            let element = res.module[i];
                            element.edit = false;
                            element.level3 = [];
                            if (element.province || element.city || element.area) {
                                element.level3 = [element.province, element.city, element.area];
                            }
                            if (!element.companyJson) {
                                element.companyJson = {     // 公司信息
                                    companyName: '',        // 企业名称
                                    companyLevel3: [],      // 三级省市区
                                    companyProvince: '',    // 省
                                    companyCity: '',        // 市
                                    companyArea: '',        // 区
                                    companyAddress: '',     // 详细地址
                                    companyOnlineAddress: '',// 公司网址
                                    companyMobile: '',      // 公司电话
                                    companyEmail: '',       // 公司邮箱
                                    companyRemark: '',      // 备注
                                    registerFee: '',        // 注册资金
                                    busyLicenseNumber: '',  // 营业执照号
                                    registerTime: ''        // 注册时间
                                };
                            } else {
                                element.companyJson = JSON.parse(element.companyJson)
                            }
                            if (element.contactJson) {
                                element.contactJson = JSON.parse(element.contactJson)
                            } else {
                                element.contactJson = []
                            }
                            result.push(element)
                        }
                    }
                } else {
                    message.info(res.msg)
                }
                dispatch(actionCreator(GET_DEFENDANT_INFO_SUCCESS, { parties: result }))
            })
        },
        // 更新对方当事人信息
        updateDefendantInfo: (data, parties, callback) => {
            let result = Object.assign({}, data);
            result.contactJson = JSON.stringify(result.contactJson)
            result.companyJson = JSON.stringify(result.companyJson)
            delete result.lawyerPersonInfoDOList;
            delete result.lawyerCompanyInfoDO;
            delete result.permBrandIdList;
            delete result.permUserId;
            delete result.permUserIdList;
            api.modifyDefendantInfo(result).then(res => {
                if (res.success) {
                    if (parties.length) {
                        for (let i = 0; i < parties.length; i++) {
                            let element = parties[i];
                            if (element.id === data.id) {
                                element = Object.assign(element, data)
                            }
                        }
                    }
                    dispatch(actionCreator(UPDATE_DEFENDANT_INFO_SUCCESS, { parties: parties }))
                } else {
                    message.info(res.msg)
                }
            })
        },
        // 删除对方当事人信息
        deleteDefendantInfo: (data, oldList, callback) => {
            api.removeDefendantInfo(data).then(res => {
                if (res.success) {
                    let result = [];
                    for (let i = 0; i < oldList.length; i++) {
                        const element = oldList[i];
                        if (element.id !== data.id) {
                            result.push(element)
                        }
                    }
                    dispatch(actionCreator(UPDATE_DEFENDANT_INFO_SUCCESS, { parties: result }));
                } else {
                    message.info(res.msg)
                }
            })
        },
        // 查询进度
        getProcessInfo: data => {
            api.getProcessInfo(data).then(res => {
                if (res.success) {
                    let dataObject = res.dataObject;
                    if (dataObject.lawyerObtainEvidenceDOList.length) {
                        for (let i = 0; i < dataObject.lawyerObtainEvidenceDOList.length; i++) {
                            const element = dataObject.lawyerObtainEvidenceDOList[i];
                            if (element.notarizationStr) {
                                element.notarizationStr = JSON.parse(element.notarizationStr)
                            }
                            if (element.notarizationInvoice) {
                                element.notarizationInvoice = JSON.parse(element.notarizationInvoice)
                            }
                            if (element.annexUrl) {
                                element.annexUrl = JSON.parse(element.annexUrl)
                            }
                            delete element.permUserId;
                            delete element.permUserIdList;
                            delete element.permBrandIdList;
                        }
                    }
                    if (dataObject.lawyerSuitCaseDO) {
                        delete dataObject.lawyerSuitCaseDO.permUserId;
                        delete dataObject.lawyerSuitCaseDO.permUserIdList;
                        delete dataObject.lawyerSuitCaseDO.permBrandIdList;
                        if (dataObject.lawyerSuitCaseDO.authCertificate) {
                            dataObject.lawyerSuitCaseDO.authCertificate = JSON.parse(dataObject.lawyerSuitCaseDO.authCertificate)
                        }
                        if (dataObject.lawyerSuitCaseDO.evidenceIndex) {
                            dataObject.lawyerSuitCaseDO.evidenceIndex = JSON.parse(dataObject.lawyerSuitCaseDO.evidenceIndex)
                        }
                        if (dataObject.lawyerSuitCaseDO.suitText) {
                            dataObject.lawyerSuitCaseDO.suitText = JSON.parse(dataObject.lawyerSuitCaseDO.suitText)
                        }
                        if (dataObject.lawyerSuitCaseDO.annexUrl) {
                            dataObject.lawyerSuitCaseDO.annexUrl = JSON.parse(dataObject.lawyerSuitCaseDO.annexUrl)
                        }
                    }
                    if (dataObject.lawyerRegisterDO) {
                        delete dataObject.lawyerRegisterDO.permUserId;
                        delete dataObject.lawyerRegisterDO.permUserIdList;
                        delete dataObject.lawyerRegisterDO.permBrandIdList;
                        if (dataObject.lawyerRegisterDO.registerNotice) {
                            dataObject.lawyerRegisterDO.registerNotice = JSON.parse(dataObject.lawyerRegisterDO.registerNotice)
                        }
                        if (dataObject.lawyerRegisterDO.summitFeeNotice) {
                            dataObject.lawyerRegisterDO.summitFeeNotice = JSON.parse(dataObject.lawyerRegisterDO.summitFeeNotice)
                        }
                        if (dataObject.lawyerRegisterDO.annexUrl) {
                            dataObject.lawyerRegisterDO.annexUrl = JSON.parse(dataObject.lawyerRegisterDO.annexUrl)
                        }
                    }

                    if (dataObject.lawyerBeforeCourtDO) {
                        delete dataObject.lawyerBeforeCourtDO.permUserId;
                        delete dataObject.lawyerBeforeCourtDO.permUserIdList;
                        delete dataObject.lawyerBeforeCourtDO.permBrandIdList;
                        if (dataObject.lawyerBeforeCourtDO.citation) {
                            dataObject.lawyerBeforeCourtDO.citation = JSON.parse(dataObject.lawyerBeforeCourtDO.citation)
                        }
                        if (dataObject.lawyerBeforeCourtDO.statement) {
                            dataObject.lawyerBeforeCourtDO.statement = JSON.parse(dataObject.lawyerBeforeCourtDO.statement)
                        }
                        if (dataObject.lawyerBeforeCourtDO.annexUrl) {
                            dataObject.lawyerBeforeCourtDO.annexUrl = JSON.parse(dataObject.lawyerBeforeCourtDO.annexUrl)
                        }
                    }
                    if (dataObject.lawyerOnCourtDO) {
                        delete dataObject.lawyerOnCourtDO.permUserId;
                        delete dataObject.lawyerOnCourtDO.permUserIdList;
                        delete dataObject.lawyerOnCourtDO.permBrandIdList;
                        if (dataObject.lawyerOnCourtDO.annexUrl) {
                            dataObject.lawyerOnCourtDO.annexUrl = JSON.parse(dataObject.lawyerOnCourtDO.annexUrl)
                        }
                    }
                    if (dataObject.lawyerJudgmentDO) {
                        delete dataObject.lawyerJudgmentDO.permUserId;
                        delete dataObject.lawyerJudgmentDO.permUserIdList;
                        delete dataObject.lawyerJudgmentDO.permBrandIdList;
                        if (dataObject.lawyerJudgmentDO.judgmentText) {
                            dataObject.lawyerJudgmentDO.judgmentText = JSON.parse(dataObject.lawyerJudgmentDO.judgmentText)
                        }
                        if (dataObject.lawyerJudgmentDO.annexUrl) {
                            dataObject.lawyerJudgmentDO.annexUrl = JSON.parse(dataObject.lawyerJudgmentDO.annexUrl)
                        }
                    }
                    if (dataObject.lawyerCloseCaseDO) {
                        delete dataObject.lawyerCloseCaseDO.permUserId;
                        delete dataObject.lawyerCloseCaseDO.permUserIdList;
                        delete dataObject.lawyerCloseCaseDO.permBrandIdList;
                        if (dataObject.lawyerCloseCaseDO.closeCaseText) {
                            dataObject.lawyerCloseCaseDO.closeCaseText = JSON.parse(dataObject.lawyerCloseCaseDO.closeCaseText)
                        }
                    }
                    dispatch(actionCreator(GET_LAW_SUIT_PROCESS_SUCCESS, { process: dataObject }))
                } else {
                    message.info(res.msg)
                }
            })
        },
        // 更新诉讼进程的状态
        updateProcessDetailStatus: (data, oldDetail, suitCaseDetail, ligiationStatus, oldSuitCaseList, callback) => {
            delete data.permUserId;
            delete data.permUserIdList;
            delete data.permBrandIdList;
            api.auditSuitInfo(data).then(res => {
                if (res.success) {
                    if (data.processType === 3) {
                        oldDetail.lawyerObtainEvidenceDOList = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerObtainEvidenceDOList[0].status = 3;
                            oldDetail.lawyerObtainEvidenceDOList[0].backReason = '';
                            suitCaseDetail.status = 3;
                        } else {
                            oldDetail.lawyerObtainEvidenceDOList[0].status = 4;
                            oldDetail.lawyerObtainEvidenceDOList[0].backReason = data.backReason;
                        }
                    } else if (data.processType === 4) {
                        oldDetail.lawyerSuitCaseDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerSuitCaseDO.status = 3;
                            oldDetail.lawyerSuitCaseDO.backReason = '';
                            suitCaseDetail.status = 4;
                        } else {
                            oldDetail.lawyerSuitCaseDO.status = 4;
                            oldDetail.lawyerSuitCaseDO.backReason = data.backReason;
                        }
                    } else if (data.processType === 5) {
                        oldDetail.lawyerRegisterDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerRegisterDO.status = 3;
                            oldDetail.lawyerSuitCaseDO.backReason = '';
                            suitCaseDetail.status = 5;
                        } else {
                            oldDetail.lawyerRegisterDO.status = 4;
                            oldDetail.lawyerRegisterDO.backReason = data.backReason;
                        }
                    } else if (data.processType === 6) {
                        oldDetail.lawyerBeforeCourtDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerBeforeCourtDO.status = 3;
                            oldDetail.lawyerBeforeCourtDO.backReason = '';
                            suitCaseDetail.status = 6;
                        } else {
                            oldDetail.lawyerBeforeCourtDO.status = 4;
                            oldDetail.lawyerBeforeCourtDO.backReason = data.backReason;
                        }
                    } else if (data.processType === 7) {
                        oldDetail.lawyerOnCourtDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerOnCourtDO.status = 3;
                            oldDetail.lawyerOnCourtDO.backReason = '';
                            suitCaseDetail.status = 7;
                        } else {
                            oldDetail.lawyerOnCourtDO.status = 4;
                            oldDetail.lawyerOnCourtDO.backReason = data.backReason;
                        }
                    } else if (data.processType === 8) {
                        oldDetail.lawyerJudgmentDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerJudgmentDO.status = 3;
                            oldDetail.lawyerJudgmentDO.backReason = '';
                            suitCaseDetail.status = 8;
                        } else {
                            oldDetail.lawyerJudgmentDO.status = 4;
                            oldDetail.lawyerJudgmentDO.backReason = data.backReason;
                        }
                    } else if (data.processType === 9) {
                        oldDetail.lawyerCloseCaseDO = JSON.parse(data.processJson)
                        if (data.saveFlag === 0) {
                            oldDetail.lawyerCloseCaseDO.status = 3;
                            oldDetail.lawyerCloseCaseDO.backReason = '';
                            if (oldDetail.lawyerCloseCaseDO.closeCaseWay === 1) {
                                suitCaseDetail.status = 9;
                            } else if (oldDetail.lawyerCloseCaseDO.closeCaseWay === 2) {
                                suitCaseDetail.status = 10;
                            } else if (oldDetail.lawyerCloseCaseDO.closeCaseWay === 3) {
                                suitCaseDetail.status = 11;
                            }
                        } else {
                            oldDetail.lawyerCloseCaseDO.status = 4;
                            oldDetail.lawyerCloseCaseDO.backReason = data.backReason;
                        }
                    }
                    let result = getName(ligiationStatus, suitCaseDetail.status)
                    suitCaseDetail.statusName = result.dictLabel;
                    suitCaseDetail.statusNameEn = result.dictLabelEn;
                    if (oldSuitCaseList.length) {
                        for (let i = 0; i < oldSuitCaseList.length; i++) {
                            const element = oldSuitCaseList[i];
                            if (suitCaseDetail.id === element.id) {
                                element.status = suitCaseDetail.status
                                element.statusName = result.dictLabel;
                                element.statusNameEn = result.dictLabelEn;
                            }
                        }
                    }
                    dispatch(actionCreator(UPDATE_LITIGATION_ALLOT_LIST_SUCCESS, { newLigiationList: oldSuitCaseList}))
                    dispatch(actionCreator(UPDATE_LAW_SUIT_DETAIL_SUCCESS, { suitCaseDetail: suitCaseDetail }))
                    dispatch(actionCreator(UPDATE_LAW_SUIT_PROCESS_SUCCESS, { process: oldDetail }))
                } else {
                    dispatch(actionCreator(UPDATE_LAW_SUIT_PROCESS_SUCCESS, { process: oldDetail }))
                    message.info(res.msg)
                }
            })
        },
        // 查询日志
        getLogs: data => {
            api.queryLogs(data).then(res => {
                if (res.success) {
                    dispatch(actionCreator(GET_LAW_SUIT_LOGS_SUCCESS, { logs: res.dataObject }))
                } else {
                    message.info(res.msg)
                }
            })
        },
        // 获取合作律师list
        getCooperativeLawyerList: (data) => {
            api.getAllotLawyer(data).then(res => {
                if (res.success) {
                    dispatch(actionCreator(GET_LAW_SUIT_COOPERATIVE_LAWYER_SUCCESS, { cooperativeLawyerList: res.result, minPageNo: data.pageNo, minToltal: res.records }))
                } else {
                    dispatch(actionCreator(GET_LAW_SUIT_COOPERATIVE_LAWYER_ERROR, { cooperativeLawyerList: [] }))
                    message.info(res.msg)
                }
            })
        },
        //分配
        editSuitDistribue: (data, oldLigiationList, callback) => {
            api.modifySuitDistribute(data).then(res => {
                if (res.success) {
                    let info={
                        suitNo: data.suitNo
                    }
                    api.getSuitDetail(info).then(response => {
                        if (response.success) {
                            let newLigiationList = [];
                            if (oldLigiationList.length) {
                                for (let i = 0; i < oldLigiationList.length; i++) {
                                    let element = oldLigiationList[i];
                                    if (element.id == data.id) {
                                        element.allotedName = response.dataObject ? response.dataObject.allotedName : '';
                                        element.gmtAllot = response.dataObject ? response.dataObject.gmtAllot : ''
                                        element.status = response.dataObject ? response.dataObject.status : ''
                                        element.statusName = response.dataObject ? response.dataObject.statusName : ''
                                        element.statusNameEn= response.dataObject ? response.dataObject.statusNameEn : ''
                                    }
                                    newLigiationList.push(element);
                                }
                            }
                            dispatch(actionCreator(UPDATE_LITIGATION_ALLOT_LIST_SUCCESS, { newLigiationList }))
                            dispatch(actionCreator(GET_LAW_SUIT_DETAIL_SUCCESS, { suitCaseDetail: response.dataObject }))
                            typeof callback === 'function' && callback()
                        } else {
                            dispatch(actionCreator(GET_LAW_SUIT_DETAIL_SUCCESS, { suitCaseDetail: {} }))
                            message.info(response.msg)
                        }
                    })
                    message.success('分配成功')
                } else {
                    dispatch(actionCreator(UPDATE_LITIGATION_ALLOT_LIST_SUCCESS, { oldLigiationList }))
                    message.error(res.msg)
                }
            })
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(LawsuitsDetail))
