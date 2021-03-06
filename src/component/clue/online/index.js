import React, { Component } from 'react'
import { Form, Row, Col, Button, Input, Alert, Table, Checkbox, DatePicker, message, Modal, Select, Upload, Tooltip, Icon } from 'antd'
import { FormattedMessage } from 'react-intl'
import Content from '../../common/layout/content/index'
import '../common/index.css'
import { formatDateToMs, getName, getButtonPrem, getFormatDate } from '../../../utils/util'
import RotaionChart from '../../common/rotationChart/index'
import ExamineModal from '../common/examine_modal/modal'
import ExcelExportModal from '../../common/layout/modal/exportExcelModal'
import Req from '../../../api/req'
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const xin = require('../../../assets/images/xin.gif');
const zuan = require('../../../assets/images/zuan.gif');
const guan = require('../../../assets/images/guan.gif');
const hg = require('../../../assets/images/huanguan.gif');
export default class OnLine extends Component {
    constructor() {
        super()
        this.state = {
            pageSize: 10,
            startTime: '',
            startTimeMs: '',
            startDate: null,
            endTime: '',
            endTimeMs: '',
            endDate: null,
            showModalVisible: false,
            showModalImg: [],
            examineModalVisible: false,
            type: 1,
            platformType: undefined,
            prodTypeId: undefined,
            userNameLikeOrMobile: '',
            status: undefined,
            queryUrl: '',
            tortsType: [],
            id: '',
            examinData: {
                id: '',
                status: '',
                brandId: undefined,
                tortsType: [],
                tempTortsType: [],
                prodCategoryId: undefined,
            },
            searchData: {
                userNameLikeOrMobile: '',
                platformType: '',
                gmtStart: '',
                gmtEnd: '',
                status: '',
                tortsType: '',
                queryUrl: '',
                prodTypeId: ''
            },
            images: {
                img1: require('../../../assets/images/one.png'),
                img2: require('../../../assets/images/two.png'),
                img3: require('../../../assets/images/three.png'),
                img4: require('../../../assets/images/four.png'),
                img5: require('../../../assets/images/five.png'),
                img6: require('../../../assets/images/six.png'),
                img7: require('../../../assets/images/seven.jpg'),
                img8: require('../../../assets/images/eight.jpg')
            },
            visibleExcelExport: false,  // 自定义导出数据的弹窗控制
			autoTitleParam: [],  //  自定义数据
            autoPageNum: 100,  // 自定义数据量
            tbName: '线上线索管理-'+ getFormatDate('yyyy-MM-dd-hh:mm')
        }
    }
    componentWillMount() {
        if (this.props.history.location.query) {
            let { userNameLikeOrMobile, platformType, gmtStart, gmtEnd, status, tortsType } = this.props.history.location.query;
            status = status.toString()
            let searchData = {
                userNameLikeOrMobile: userNameLikeOrMobile,
                platformType: platformType === undefined ? '' : platformType,
                gmtStart: gmtStart,
                gmtEnd: gmtEnd,
                status: status === undefined ? '' : status,
                tortsType: tortsType || ''
            }
            this.setState({
                status,
                gmtStart,
                gmtEnd,
                tortsType: tortsType || [],
                platformType: platformType,
                searchData: Object.assign({}, searchData, this.state.searchData)
            }, () => this.getOnlineList([], 1))
        } else {
            this.getOnlineList([], 1)
        }
        if (this.props.getExportExcelTitle) {
            this.props.getExportExcelTitle({excelType: 8})
        }
    }
    // 获取数据
    getOnlineList(oldList, pageNo) {
        let { searchData, pageSize } = this.state;
        let data = Object.assign({}, searchData);
        data.queryUrl = encodeURIComponent(searchData.queryUrl);
        data.pageSize = pageSize;
        data.pageNo = pageNo;
        this.props.getOnlineList(data, oldList)
    }

    // 改变分页大小
    changePageSize(current, size) {
        this.setState({
            pageSize: size
        }, () => {
            this.getOnlineList([], 1)
        })
    }
    // 搜索
    handleSearch() {
        let { searchData, userNameLikeOrMobile, platformType, startTime, endTime, status, tortsType, queryUrl, prodTypeId } = this.state;
        searchData = {
            userNameLikeOrMobile: userNameLikeOrMobile,
            platformType: platformType === undefined ? '' : platformType,
            prodTypeId: prodTypeId === undefined ? '' : prodTypeId,
            gmtStart: startTime,
            gmtEnd: endTime,
            status: status === undefined ? '' : status,
            tortsType: tortsType.toString(),
            queryUrl
        }
        this.setState({
            searchData
        }, () => this.getOnlineList([], 1))
    }

    // 重置
    handleReset() {
        let searchData = {
            userNameLikeOrMobile: '',
            platformType: '',
            gmtStart: '',
            gmtEnd: '',
            status: '',
            tortsType: '',
            queryUrl: '',
            prodTypeId: ''
        }
        this.setState({
            startTime: '',
            startTimeMs: '',
            startDate: null,
            endTime: '',
            endTimeMs: '',
            endDate: null,
            platformType: undefined,
            prodTypeId: undefined,
            userNameLikeOrMobile: '',
            status: undefined,
            tortsType: '',
            queryUrl: '',
            searchData
        }, () => this.getOnlineList([], 1))
    }

    // 创建分页器配置项
    createPaginationOption() {
        let { pageNo, total } = this.props;
        let { pageSize } = this.state;
        return {
            current: pageNo,
            pageSize,
            showQuickJumper: true,
            showSizeChanger: true,
            total,
            onChange: (page, pageSize) => this.getOnlineList([], page),
            onShowSizeChange: (current, size) => this.changePageSize(current, size)
        }
    }

    // 选择日期
    changeDatePicker(date, dateStr, type) {
        let { startTimeMs, endTimeMs } = this.state;
        if (type === 'startTime') {
            startTimeMs = formatDateToMs(dateStr);
        } else if (type === 'endTime') {
            endTimeMs = formatDateToMs(dateStr)
        }
        if (endTimeMs && (endTimeMs - startTimeMs < 0)) {
            let { intl } = this.props;
            message.warning(intl.formatMessage({ id: 'monitor.please.select.a.valid.time.range', defaultMessage: "请选择有效的时间范围", description: "请选择有效的时间范围" }));
            return
        }
        if (type === 'startTime') {
            this.setState({
                startTimeMs,
                startTime: dateStr,
                startDate: date
            })
        } else {
            this.setState({
                endTimeMs,
                endTime: dateStr,
                endDate: date
            })
        }
    }
    // 选择选项
    checkChange(tortsType) {
        let infringementList = this.props.infringementList;
        this.setState({
            tortsType,
            indeterminate: !!tortsType.length && (tortsType.length < infringementList.length),
            checkedAll: tortsType.length === infringementList.length,
        })
    }

    // 全选
    checkedAllChange(e) {
        let infringementList = this.props.infringementList;
        let tortsType = [0, 1, 2, 3, 4, 5, 6, 7, 8]
        for (let i = 0; i < infringementList.length; i++) {
            const element = infringementList[i];
            tortsType.push(element.dictVal)
        }
        this.setState({
            tortsType: e.target.checked ? tortsType : [],
            indeterminate: false,
            checkedAll: e.target.checked,
        })
    }

    //渲染来源
    renderSource(item) {
        return (
            <div className="table-info">
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="report.reporter" defaultMessage="举报人" description="举报人" />: </span>
                    {item.finalName}
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="complaint.reporter.mobile" defaultMessage="举报人手机" description="举报人手机" />: </span>
                    {item.userMobile}
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="report.report.time" defaultMessage="举报时间" description="举报时间" />: </span>
                    {item.reportTime ? item.reportTime.split(' ')[0] : ''}
                </p>
            </div>
        )
    }
    //渲染举报信息
    renderInformation(item) {
        let { intl } = this.props
        let icons = [],types = [];
        if (item.mainPics) {
            types = item.mainPics.split(",");
            icons = <img className="checkbox-icon" src={types && types.length ?types[0]:''} key={0} alt="icon" onClick={() => this.showModalImg(types)} />
        }
        return (
            <div className="table-info">
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="clue.online.reporting.platform" defaultMessage="举报平台" description="举报平台" />: </span>
                    {
                        intl.locale === 'en'
                        ? item.platformNameEn
                        : item.platformName
                    }
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="clue.report.shop.link" defaultMessage="商品链接" description="商品链接" />:
                    </span>
                    <span className="item-link">
                        <Tooltip ttile={item.goodsLink}>
                            <a href={item.goodsLink} title={item.goodsLink} target='_blank'>{item.goodsLink}</a>
                        </Tooltip>
                    </span>
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="clue.report.brand" defaultMessage="假冒品牌" description="假冒品牌" />: </span>
                    {item.brand}
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="clue.report.note" defaultMessage="备注" description="备注" />: </span>
                    {item.note}
                </p>
                <p className="table-item table-item-img">
                    {icons}
                </p>
                {
                    types && types.length<=0?'':(
                        <p style={{width:'100%'}}>
                            <FormattedMessage id ='global.img.data' defaultMessage={ `图片共（${types && types.length ? types.length : 0}）条数据`} values={{count: <b>{types && types.length ? types.length : 0}</b>}}/>
                        </p>
                    )
                }
            </div>
        )
    }
    //商品信息
    renderGoodInfo(item) {
        return (
            <div className="table-info">
                <p className="table-item">
                    {
                        item.detailDO && item.detailDO.title
                            ? <a href={item.detailDO.url} title={item.detailDO.title} target='_blank'>{item.detailDO.title}</a>
                            : <a href={item.detailDO.url} title={item.detailDO.url} target='_blank'>{item.detailDO.url}</a>
                    }
                </p>
                <p className="table-item">
                    <span className="table-lable table-item-w50"><FormattedMessage id="monitor.price" defaultMessage="价格" description="价格" />: {item.detailDO ? item.detailDO.price : ''}</span>
                    <span className="table-lable table-item-w50"><FormattedMessage id="clue.report.brand.stock" defaultMessage="库存" description="库存" />: {item.detailDO ? item.detailDO.totalQuantity : ''}</span>
                </p>
                <p className="table-item">
                    <span className="table-lable table-item-w50"><FormattedMessage id="monitor.storeName" defaultMessage="店铺名称" description="店铺名称" />: {item.detailDO ? item.detailDO.storeName : ''}</span>
                    <span className="table-lable table-item-w50"><FormattedMessage id="clue.report.shop.leave" defaultMessage="店铺等级" description="店铺等级" />: {this.renderStoreLevel(item.detailDO.storeLevel)}</span>
                </p>
                <p className="table-item">
                    <span className="table-lable table-item-w50"><FormattedMessage id="monitor.address" defaultMessage="发货地" description="发货地" />: {item.detailDO ? item.detailDO.consignmentPlace : ''}</span>
                    <span className="table-lable table-item-w50"><FormattedMessage id="monitor.thirty.days.sales" defaultMessage="30天销量" description="30天销量" />: {item.detailDO ? item.detailDO.salesVolume : ''}</span>
                </p>
                <p className="table-item">
                    <span className="table-lable table-item-w50"><FormattedMessage id="complaint.wangwang.id" defaultMessage="旺旺ID" description="旺旺ID" />: {item.detailDO ? item.detailDO.sellerNick : ''}</span>
                    <span className="table-lable table-item-w50"><FormattedMessage id="clue.report.brand.information" defaultMessage="品牌信息" description="品牌信息" />:  {item.detailDO ? item.detailDO.brands : ''}</span>
                </p>
                <p className="table-item">
                    <span className="table-lable table-item-w50"><FormattedMessage id="clue.report.brand.evaluate" defaultMessage="评价" description="评价" />: {item.detailDO ? item.detailDO.evaluate : ''}</span>
                </p>
            </div>
        )
    }
    // 渲染店铺等级
    renderStoreLevel(item) {
        let icon = '';
        if (item >= 4 && item <= 10) {
            icon = <span><img src={xin} alt="心" /></span>
        } else if (item >= 11 && item <= 40) {
            icon = <span><img src={xin} alt="心" /><img src={xin} alt="心" /></span>
        } else if (item >= 41 && item <= 90) {
            icon = <span><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /></span>
        } else if (item >= 91 && item <= 150) {
            icon = <span><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /></span>
        } else if (item >= 151 && item <= 250) {
            icon = <span><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /><img src={xin} alt="心" /></span>
        } else if (item >= 251 && item <= 500) {
            icon = <span><img src={zuan} alt="钻" /></span>
        } else if (item >= 501 && item <= 1000) {
            icon = <span><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /></span>
        } else if (item >= 1001 && item <= 2000) {
            icon = <span><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /></span>
        } else if (item >= 2001 && item <= 5000) {
            icon = <span><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /></span>
        } else if (item >= 5001 && item <= 10000) {
            icon = <span><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /><img src={zuan} alt="钻" /></span>
        } else if (item >= 10001 && item <= 20000) {
            icon = <span><img src={guan} alt="皇冠" /></span>
        } else if (item >= 20001 && item <= 50000) {
            icon = <span><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /></span>
        } else if (item >= 50001 && item <= 100000) {
            icon = <span><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /></span>
        } else if (item >= 100001 && item <= 200000) {
            icon = <span><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /></span>
        } else if (item >= 200001 && item <= 500000) {
            icon = <span><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /><img src={guan} alt="皇冠" /></span>
        } else if (item >= 500001 && item <= 1000000) {
            icon = <span><img src={hg} alt="金冠" /></span>
        } else if (item >= 1000001 && item <= 2000000) {
            icon = <span><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /></span>
        } else if (item >= 2000001 && item <= 5000000) {
            icon = <span><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /></span>
        } else if (item >= 5000001 && item <= 10000000) {
            icon = <span><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /></span>
        } else if (item > 10000001) {
            icon = <span><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /><img src={hg} alt="金冠" /></span>
        }
        return icon;
    }
    //渲染侵权信息
    renderTort(item) {
        let { intl } = this.props
        let icons = [];
        if (item.tortsType) {
            let images = this.state.images;
            let types = item.tortsType.split(",");
            for (let i = 0; i < types.length; i++) {
                const element = types[i];
                icons.push(<img className="checkbox-icon" key={element + i} src={images['img' + element]} alt="icon" />)
            }
        }
        return (
            <div className="table-info">
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="complaint.brand" defaultMessage="侵权品牌" description="侵权品牌" />: </span>
                    {item.brandName}
                </p>
                <p className="table-item">
                    <span className="table-lable"><FormattedMessage id="monitor.tort.type" defaultMessage="侵权类型" description="侵权类型" />:</span>
                    {icons}
                </p>
                {
                    item.prodCategoryNameEng ?
                        <p className="table-item">
                            <span className="table-lable-span">
                                <span className="table-lable">
                                    <FormattedMessage id="clue.report.product.kind" defaultMessage="产品分类" description="产品分类" />:
                            </span>
                                <span style={{ width: '50px' }}>
                                    <Tooltip placement="leftTop" title={intl.locale === 'en' ? item.prodCategoryNameEn : item.prodCategoryName}>
                                        {intl.locale === 'en' ? item.prodCategoryNameEn : item.prodCategoryName}
                                    </Tooltip>
                                </span>
                            </span>
                        </p> : ''
                }
            </div>
        )
    }
    //渲染状态
    renderStatus(text, record) {
        let { intl } = this.props
        if (record.monitorStatus === 2) {
            return (<span>{intl.locale === 'zh' ? record.statusName : record.statusNameEn}</span>)
        } else {
            return (<span>{intl.locale === 'zh' ? record.statusName : record.statusNameEn}</span>)
        }
    }
    //渲染操作
    renderOpearate(record) {
        let { permissionList } = this.props
        if (record.status === 1) {
            return (
                getButtonPrem(permissionList, '009001002') ?
                    [
                        <a key='pass' onClick={() => this.examineModal(record)}>
                            <FormattedMessage id="global.pass" defaultMessage="通过" description="通过" />
                        </a>,
                        <br key='br' />,
                        <a key='fail' onClick={() => this.showConfirm(record.id)}>
                            <FormattedMessage id="global.fail" defaultMessage="不通过" description="不通过" />
                        </a>
                    ] : ''
            )
        }
    }
    // 创建table配置
    createColumns() {
        const columns = [{
            title: <FormattedMessage id="clue.online.source" defaultMessage="来源" description="来源" />,
            width: '15%',
            key: 'dataFrom',
            render: (text, record) => this.renderSource(record)
        }, {
            title: <FormattedMessage id="clue.online.report.information" defaultMessage="举报信息" description="举报信息" />,
            width: '20%',
            render: (text, record) => this.renderInformation(record)
        }, {
            title: <FormattedMessage id="clue.online.good.information" defaultMessage="商品信息" description="商品信息" />,
            width: '20%',
            render: (text, record) => this.renderGoodInfo(record)
        }, {
            title: <FormattedMessage id="clue.online.page.screenshot" defaultMessage="页面截图" description="页面截图" />,
            width: '10%',
            render: (text, record) => {
                return (
                    <div>
                        <img style={{ width: '100px', height: '100px' }} src={record.detailDO ? record.detailDO.screenshotUrl : ''} alt="" onClick={() => this.showModalImg(record.detailDO.screenshotUrl)} />
                    </div>
                )
            }
        }, {
            title: <FormattedMessage id="global.status" defaultMessage="状态" description="状态" />,
            width: '10%',
            render: (text, record) => this.renderStatus(text, record)
        }, {
            title: <FormattedMessage id="clue.online.tort.information" defaultMessage="侵权信息" description="侵权信息" />,
            width: '15%',
            render: (text, record) => this.renderTort(record)
        }, {
            title: <FormattedMessage id="global.operate" defaultMessage="操作" description="操作" />,
            width: '10%',
            render: (text, record) => this.renderOpearate(record)
        }];
        return columns;
    }

    //显示页面截图
    showModalImg(imgUrl) {
        this.setState({
            showModalVisible: true,
            showModalImg: imgUrl
        })
    }
    handleCancelImg() {
        this.setState({
            showModalVisible: false,
            showModalImg: []
        })
    }
    //通过按钮
    examineModal(record) {
        let { examinData } = this.state
        examinData = {
            id: '',
            status: '',
            brandId: record.brandId,
            tortsType: [],
            tempTortsType: [],
            prodCategoryId: undefined,
        }
        this.setState({
            examineModalVisible: true,
            clue: 'clue',
            id: record.id,
            examinData,
        })
    }
    // 显示不通过时提示弹窗
    showConfirm(id) {
        let intl = this.props.intl;
        this.setState({
            id: id
        }, () => {
            confirm({
                title: intl.formatMessage({ id: "clue.lead.review", defaultMessage: "线上线索审核", description: "线上线索审核" }),
                content: intl.formatMessage({ id: "clue.lead.review.fail", defaultMessage: "您确认不通过该线上线索数据吗？", description: "您确认不通过该线上线索数据吗？" }),
                onOk: () => this.failExaminePass()
            })
        })
    }

    //确定审核通过
    onOkExamine() {
        let { id, examinData } = this.state
        let { updateOnLineItem, onLineList, intl, prodList, brandList, onlineClueStatus } = this.props
        if (examinData.tempTortsType.length > 0) {
            examinData.tortsType = examinData.tempTortsType
            let torts = examinData.tortsType.join(",")
            examinData.tortsType = torts;
        }
        examinData.id = id
        examinData.status = 2
        this.setState({
            examineModalVisible: false,
        })
        let statusData = getName(onlineClueStatus, examinData.status)
        examinData.prodCategoryName = getName(prodList, examinData.prodCategoryId, 'prod').name
        examinData.prodCategoryNameEng = getName(prodList, examinData.prodCategoryId, 'prod').nameEng
        examinData.brandName = getName(brandList, examinData.brandId, 'brand').name
        examinData.statusName = statusData.dictLabel
        examinData.statusNameEn = statusData.dictLabelEn
        updateOnLineItem(examinData, onLineList, () => {
            message.success(intl.formatMessage({ id: "global.operation.success", defaultMessage: "操作成功", description: "操作成功后的描述信息" }))
        })
    }
    //取消
    cancelExamine() {
        this.setState({
            examineModalVisible: false,
        })
    }
    //审核不通过
    failExaminePass() {
        let { id, examinData } = this.state
        let { updateOnLineItem, onLineList, intl, onlineClueStatus } = this.props
        examinData.id = id
        examinData.status = 3
        examinData.tortsType = []
        examinData.tempTortsType = []
        examinData.brandId = ''
        examinData.prodCategoryId = ''
        examinData.prodCategoryName = ''
        examinData.prodCategoryNameEng = ''
        let statusData = getName(onlineClueStatus, examinData.status)
        examinData.statusName = statusData.dictLabel
        examinData.statusNameEn = statusData.dictLabelEn
        this.setState({
            examineModalVisible: false,
        })
        updateOnLineItem(examinData, onLineList, () => {
            message.success(intl.formatMessage({ id: "global.operation.success", defaultMessage: "操作成功", description: "操作成功后的描述信息" }))
        })
    }

    //审核modal select onChange事件
    examineModalChange(value, type) {
        let tempData = this.state.examinData
        tempData[type] = value
        this.setState({
            examinData: tempData
        })
    }

    // 导入
    importExcel({ file }) {
        if (file.status === 'done' && file.response.success) {
            let data = {
                type: 0,
                excelType: 6,
                excelUrl: file.response.dataObject,
                excelName: file.name
            };
            this.props.saveExcelData(data)
            // message.info(file.response.msg)
            this.getOnlineList([], 1)
        } else if (file.status === 'done' && !file.response.success) {
            message.info(file.response.msg)
        } else if (file.status === 'error') {
            message.info('导入失败，请稍后再试。')
        }
    }

    // 显示自定义导出弹窗
	showExportExcelModal() {
		let result = localStorage.getItem('excelImport');
		let { exportExcelTitle } = this.props;
		if (result) {
			result = JSON.parse(result);
			if (!result.clueOnlin) {
				let autoTitleParam = [];
				for (let i = 0; i < exportExcelTitle.length; i++) {
					const element = exportExcelTitle[i];
					if (element.excelType === 8) {
						autoTitleParam.push(element.num)
					}
				}
				this.setState({
					autoTitleParam,
					visibleExcelExport: true
				})
			} else {
				this.setState({
					autoTitleParam: result.clueOnlin,
					visibleExcelExport: true
				})
			}
		} else if (!result) {
			let autoTitleParam = [];
			for (let i = 0; i < exportExcelTitle.length; i++) {
				const element = exportExcelTitle[i];
				if (element.excelType === 8) {
					autoTitleParam.push(element.num)
				}
			}
			this.setState({
				autoTitleParam,
				visibleExcelExport: true
			})
		}
	}

	// 确认导出
	confirmExcel(data) {
		let result = localStorage.getItem('excelImport');
		if (!result) {
			result = {}
		} else {
			result = JSON.parse(result);
		}
		result.clueOnlin = data.autoTitleParam;
		localStorage.setItem('excelImport', JSON.stringify(result))
		this.setState({
			autoTitleParam: data.autoTitleParam,
            autoPageNum: data.autoPageNum,
            tbName: data.tbName,
			visibleExcelExport: false
		}, () => {
			this.exportExcel()
		})
	}

    // 导出
    exportExcel() {
        let { searchData, autoTitleParam, autoPageNum, tbName } = this.state
        let { saveExcelData, platfromList, onlineClueStatus, infringementList, prodList } = this.props;
        let queryParamStr = [];
        if (searchData.userNameLikeOrMobile) {
            queryParamStr.push(`举报人:${searchData.userNameLikeOrMobile}`)
        }
        if (searchData.platformType || searchData.platformType === 0) {
            let platformType = getName(platfromList,searchData.platformType);
            queryParamStr.push(`举报平台:${platformType.dictLabel}`)
        }
        if (searchData.status || searchData.status === 0) {
            let status = getName(onlineClueStatus,searchData.status);
            queryParamStr.push(`状态:${status.dictLabel}`)
        }
		if (searchData.gmtStart) {
            queryParamStr.push(`开始时间:${searchData.gmtStart}`)
        }
        if (searchData.gmtEnd) {
            queryParamStr.push(`截止时间:${searchData.gmtEnd}`)
        }
        if (searchData.tortsType) {
            let tortsType = searchData.tortsType.split(',');
            let result = [];
            if (tortsType.length) {
                for (let i = 0; i < tortsType.length; i++) {
                    let temp = parseInt(tortsType[i], 10);
                    let element = getName(infringementList, temp)
                    result.push(element.dictLabel);
                }
            }
            queryParamStr.push(`侵权类型:${result.toString()}`)
        }
        if (searchData.queryUrl) {
            queryParamStr.push(`商品链接:${searchData.queryUrl}`)
        }
        if (searchData.prodTypeId) {
			let prodType = getName(prodList, searchData.prodTypeId, 'prod');
			queryParamStr.push(`商品类别:${prodType.name}`)
		}
        let result = Object.assign({}, searchData);
        result.queryUrl = encodeURIComponent(searchData.queryUrl);
        let data = {
            type: 1,
            excelType: 8,
            queryParam: JSON.stringify(result),
            queryParamStr: queryParamStr.toString(),
			autoTitleParam: autoTitleParam.toString(),
            autoPageNum,
            tbName
        }
        saveExcelData(data)
    }

    render() {
        let { intl, isFetch, onLineList, total, infringementList, platfromList, brandList, prodList, permissionList, onlineClueStatus, exportExcelTitle } = this.props;
        let { userNameLikeOrMobile, platformType, tortsType, images, status, showModalVisible, showModalImg, examineModalVisible, clue, examinData, queryUrl, visibleExcelExport, autoTitleParam, tbName, prodTypeId } = this.state
        let breadcrumbData = [
            { link: '/', titleId: 'router.home', title: '首页' },
            { link: '', titleId: 'router.clues.task.management', title: '线索及任务管理' },
            { link: '', titleId: 'router.online.clue.tip.off', title: '线上线索管理' }
        ]
        return (
            <Content breadcrumbData={breadcrumbData} className="clue-online">
                <div className="search-form">
                    <Row>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "clue.online.informant", defaultMessage: "举报人", description: "举报人" })}>
                                <Input onPressEnter={(e) => this.handleSearch()} placeholder={intl.formatMessage({ id: "clue.online.please.informant", defaultMessage: "请输入举报人", description: "请输入举报人" })}
                                    onChange={e => this.setState({ userNameLikeOrMobile: e.target.value.trim() })} value={userNameLikeOrMobile} />
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "clue.online.reporting.platform", defaultMessage: "举报平台", description: "举报平台" })}>
                                <Select
                                    placeholder={intl.formatMessage({ id: "clue.online.choose.reporting.platform", defaultMessage: "请选择商品来源", description: "请选择商品来源" })}
                                    value={platformType}
                                    onChange={value => this.setState({ platformType: value })}
                                    showSearch
                                    filterOption={(input, option) => option.props.value === '' ? false : option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    <Option value=""><FormattedMessage id="global.all" defaultMessage="全部" description="全部" /></Option>
                                    {
                                        platfromList && platfromList.filter(item => item.isDel === 0)
                                            .map(opt => <Option key={opt.dictVal} value={opt.dictVal}>
                                                {
                                                    intl.locale === 'en'
                                                        ? opt.dictLabelEn
                                                        : opt.dictLabel
                                                }
                                            </Option>)
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "global.start.time", defaultMessage: "开始时间", description: "开始时间" })}>
                                <DatePicker onChange={(date, dateStr) => this.changeDatePicker(date, dateStr, 'startTime')} value={this.state.startDate} />
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "global.end.time", defaultMessage: "截止时间", description: "截止时间" })}>
                                <DatePicker onChange={(date, dateStr) => this.changeDatePicker(date, dateStr, 'endTime')} value={this.state.endDate} />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "global.status", defaultMessage: "状态", description: "状态" })}>
                                <Select
                                    placeholder={intl.formatMessage({ id: "global.please.select.status", defaultMessage: "请选择状态", description: "请选择状态" })}
                                    value={status}
                                    onChange={val => this.setState({ status: val })}
                                >
                                    <Option value=""><FormattedMessage id="global.all" defaultMessage="全部" description="全部" /></Option>
                                    {
                                        onlineClueStatus && onlineClueStatus.filter(item => item.isDel === 0)
                                            .map(opt => <Option key={opt.dictVal} value={opt.dictVal}>
                                                {
                                                    intl.locale === 'en'
                                                        ? opt.dictLabelEn
                                                        : opt.dictLabel
                                                }
                                            </Option>)
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "global.prod.url", defaultMessage: "商品链接", description: "商品链接" })}>
                                <Input 
                                    value={queryUrl} 
                                    onPressEnter={(e) => this.handleSearch()} 
                                    onChange={e => this.setState({ queryUrl: e.target.value.trim() })}
                                    placeholder={intl.formatMessage({ id: "global.please.enter.prod.url", defaultMessage: "请输入商品链接", description: "请输入商品链接" })} 
                                />
                            </FormItem>
                        </Col>
                        <Col span={6}>
                            <FormItem label={intl.formatMessage({ id: "report.category", defaultMessage: "商品类别", description: "商品类别" })}>
                                <Select
                                    showSearch
                                    value={prodTypeId}
                                    dropdownMatchSelectWidth={false}
                                    onChange={(e) => this.setState({prodTypeId: e})}
                                    placeholder={intl.formatMessage({ id: "report.please.select.torts.goods.category", defaultMessage: "请选择商品类别", description: "请选择商品类别" })}
                                    filterOption={(input, option) => option.props.value === '' ? false : option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    <Select.Option value="">
                                        <FormattedMessage id="global.all" defaultMessage="全部" description="全部" />
                                    </Select.Option>
                                    {
                                        prodList && prodList.filter(item => item.isDel === 0)
                                            .map(opt => <Select.Option key={opt.id} value={opt.id}>{intl.locale === 'zh' ? opt.name : opt.nameEn}</Select.Option>)
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                    <Col span={24}>
                            <FormItem label={intl.formatMessage({ id: "monitor.tort.type", defaultMessage: "侵权类型", description: "侵权类型" })}>
                                <CheckboxGroup
                                    className="search-check"
                                    value={tortsType}
                                    onChange={checkedList => this.checkChange(checkedList)}
                                >
                                    {
                                        infringementList && infringementList.map(item => (
                                            <Checkbox
                                                value={item.dictVal}
                                                key={item.dictVal}
                                                onChange={e => this.checkChange(e)}
                                            >
                                                <img className="checkbox-icon" src={images['img' + item.dictVal]} alt="icon" />
                                                {
                                                    intl.locale === 'en'
                                                    ? item.dictEn
                                                    : item.dictLabel
                                                }
                                            </Checkbox>
                                        ))
                                    }
                                </CheckboxGroup>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6}></Col>
                        <Col span={6}></Col>
                        <Col span={6}></Col>
                        <Col span={6}>
                            <div className="search-form-btns">
                                <Button type="primary" onClick={() => this.handleSearch()}>
                                    <FormattedMessage id="global.search" defaultMessage="搜索" description="搜索" />
                                </Button>
                                <Button onClick={() => this.handleReset()}>
                                    <FormattedMessage id="global.reset" defaultMessage="重置" description="重置" />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>
                <Row className="operation-btns">
                    <Col span={24}>
                        {
                            getButtonPrem(permissionList, '009001003') ?
                                <Upload
                                    action={Req.uploadFile}
                                    showUploadList={false}
                                    withCredentials={true}
                                    onChange={(file) => this.importExcel(file)}
                                >
                                    <Button className="first upload-inport-style"><FormattedMessage id="global.import" defaultMessage="导入" description="导入" /></Button>
                                </Upload> : ''
                        }
                        {
                            getButtonPrem(permissionList, '009001004')
                                ? <Button onClick={() => this.showExportExcelModal()}>
                                    <FormattedMessage id="global.export" defaultMessage="导出" description="导出" />
                                </Button>
                                : ''
                        }
                        {
                            getButtonPrem(permissionList, '009001003') ?
                                <a style={{ marginLeft: '15px', color: '#668fff' }} download="线上线索管理模版" href={Req.downloadExcelTemplate + `?num=5`}>
                                    <FormattedMessage id="global.download.import.template" defaultMessage="下载导入模板" description="下载导入模板" />
                                </a>
                                : ''
                        }
                    </Col>
                </Row>
                <Alert message={intl.formatMessage({ id: "global.a.total.of.data.in.the.interface", defaultMessage: `界面共（${total === undefined ? '0' : total}）条数据`, description: `界面共（100）条数据` }, { count: total })} type="info" showIcon className="Alert_info" />
                <Table dataSource={onLineList} columns={this.createColumns()} pagination={this.createPaginationOption()} rowKey="id" loading={isFetch} />
                <Modal
                    title={intl.formatMessage({ id: "global.picture.details", defaultMessage: "图片详情", description: "图片详情" })}
                    visible={showModalVisible}
                    onCancel={() => this.handleCancelImg()}
                    footer={false}
                    >
                    <RotaionChart
                        imgUrl={showModalImg}
                    />
                </Modal>
                <ExamineModal
                    visible={examineModalVisible}
                    clue={clue}
                    brandList={brandList}
                    prodList={prodList}
                    infringementList={infringementList}
                    examinData={examinData}
                    onCancel={() => this.cancelExamine()}
                    onOk={() => this.onOkExamine()}
                    examineModalChange={(value, type) => this.examineModalChange(value, type)}
                />
                <ExcelExportModal
					onCancel={() => this.setState({ visibleExcelExport: false, autoTitleParam: [] })}
					onOk={data => this.confirmExcel(data)}
					visible={visibleExcelExport}
					data={exportExcelTitle}
					checkedData={autoTitleParam}
					title={intl.formatMessage({ id: "global.export", defaultMessage: "导出", description: "导出" })}
                    total={total}
                    tbName={tbName}
				/>
            </Content>
        )
    }
}
