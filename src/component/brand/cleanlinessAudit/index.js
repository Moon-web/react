import React, { Component } from 'react'
import { Button, message, Card, Form, Icon, Input, Select, Radio, Modal, Tooltip } from 'antd'
import { FormattedMessage } from 'react-intl'
import Content from '../../common/layout/content/index'
import UploadList from '../../common/upload/index'
import PictureModal from '../../common/layout/modal/pictureModal'
import Edit from '../../common/editor/editor'
import { queryUrlParams, getName } from '../../../utils/util'
const FormItem = Form.Item;
const SelectOption = Select.Option;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

export default class CleanlinessAudit extends Component {
    constructor() {
        super()
        this.state = {
            id: '',                     // id
            auditStatus: '',            // 状态
            type: '1',                  // 侵权类型 1盗图 2 商标 3 美术作品
            prodCategoryId: undefined,  // 商品分类ID
            refChannel: '',      // 侵权商标名称/图片
            siteToAppear: undefined,    // 商标出现位置
            reportReasonId: '',         // 举报理由ID
            reportReason: '',       // 举报理由名称/图片
            // reportReasonPhoto: '',      // 举报理由截图
            reportReasonPhotoList: [],  // 举报理由截图
            refChannelId: '',           // 参照渠道ID
            // prodPhoto: '',              // 侵权商品截图
            prodPhotoList: [],          // 侵权商品截图
            officialProdUrl: '',        // 官方商品链接
            // officialProdPhotoUrl: '',   // 官方商品图片
            officialProdPhotoList: [],  // 官方商品图片
            remark: '',                 // 备注
            showImg: '',                // 大图
            visible: false,             // 图片弹窗显示控制
            visibleOperate: false,      // 操作弹窗显示控制
            editType: 'trademark',      // 默认操作弹窗
            result: '',                 // 弹窗操作临时变量
            checkFlag: true,            // 校验链接
            uploadVisible: false,
            uploadList: [],
            uploadListKey: '',
            clearImgs: false,
            html: ''
        }
    }

    componentWillMount() {
        let { location, reportReasonList, auditbrandCleanProdList, channelList, trademarkList } = this.props;
        let { type } = this.state
        if (location.search) {
            // 获取参数 - 0 是因为url传参是字符串类型  需要转成number类型
            let id = queryUrlParams('resultId');
            let brandId = queryUrlParams('brandId');
            let prodUrl = queryUrlParams('prodUrl');
            prodUrl = decodeURIComponent(prodUrl);
            let platformTypeId = queryUrlParams('platformTypeId');
            this.setState({
                id,
                brandId: Number(brandId),
                prodUrl,
                platformTypeId: Number(platformTypeId)
            }, () => {
                // 默认请求盗图的参照渠道和举报理由
                this.getVrResourcesList({ brandId, type: 1, relationType: 1 })
                this.getVrResourcesList({ brandId, type: 3, relationType: 1 })
                this.getAuditProdListData()
                this.getReportTypeList()

            })
        } else {
            message.info('获取信息失败请返回重试！')
        }
        if (reportReasonList.length > 0) {
            this.setData(reportReasonList[0], 'reportReason')
            this.setData(reportReasonList[0].id, 'reportReasonId')
            this.setData(reportReasonList[0].id, 'result')
        }
        if (auditbrandCleanProdList && auditbrandCleanProdList.length === 1) {
            this.setData(auditbrandCleanProdList[0].id, 'prodCategoryId')
        }
        if (channelList && channelList.length === 1) {
            if (this.state.type === '2') {
                this.setData(channelList[0], 'refChannel')
                this.setData(channelList[0].id, 'result')
            } else {
                this.setData(channelList[0].id, 'refChannelId')
            }
        }
        if (channelList && channelList.length === 1 && type !== '2') {
            this.setData(channelList[0].id, 'refChannelId')
        }
        if (trademarkList && trademarkList.length === 1 && type === '2') {
            this.setData(trademarkList[0], 'refChannel')
            this.setData(trademarkList[0].id, 'result')
            this.setData(trademarkList[0].id, 'refChannelId')
        }
    }
    componentWillReceiveProps(nextprops) {
        let { type } = this.state
        if (nextprops.auditbrandCleanProdList && nextprops.auditbrandCleanProdList.length === 1) {
            this.setState({
                prodCategoryId: nextprops.auditbrandCleanProdList[0].id
            })
        }
        if (nextprops.reportReasonList !== this.props.reportReasonList) {
            if (nextprops.reportReasonList.length) {
                this.setData(nextprops.reportReasonList[0], 'reportReason')
                this.setData(nextprops.reportReasonList[0].id, 'reportReasonId')
                this.setData(nextprops.reportReasonList[0].id, 'result')
            }
        }
        if (nextprops.channelList && nextprops.channelList.length === 1 && type !== '2') {
            this.setData(nextprops.channelList[0].id, 'refChannelId')
        }
        if (nextprops.trademarkList && nextprops.trademarkList.length === 1 && type === '2') {
            this.setData(nextprops.trademarkList[0], 'refChannel')
            this.setData(nextprops.trademarkList[0].id, 'result')
            this.setData(nextprops.trademarkList[0].id, 'refChannelId')
        }
    }

    // 产品分类
    getReportTypeList() {
        let { getReportTypeList } = this.props;
        let { brandId } = this.state
        let data = {
            brandId: brandId,
            dictType: 18
        }
        getReportTypeList(data)
    }

    // 产品分类
    getAuditProdListData() {
        let { getAuditProdList, userInfo } = this.props;
        let { brandId } = this.state
        let data = {
            userId: userInfo.userId,
            brandId: brandId
        }
        getAuditProdList(data)
    }

    // 改变选项获取资源
    handleChange(value, key) {
        let { type, brandId = '', prodCategoryId = '' } = this.state;
        this.setData(value, key)
        if (key !== 'type') {
            if (key === 'brandId') {
                brandId = value;
            }
            if (key === 'prodCategoryId') {
                prodCategoryId = value;
            }
        } else {
            type = value;
            this.setState({
                prodCategoryId: undefined,  // 商品分类ID
                refChannel: '',      // 侵权商标名称/图片
                siteToAppear: undefined,    // 商标出现位置
                reportReasonId: '',         // 举报理由ID
                reportReason: '',       // 举报理由名称/图片
                reportReasonPhotoList: [],  // 举报理由截图
                refChannelId: '',           // 参照渠道ID
                prodPhotoList: [],          // 侵权商品截图
                officialProdUrl: '',        // 官方商品链接
                officialProdPhotoList: [],  // 官方商品图片
            })
        }
        if (type === '1') {
            // 盗图
            this.getVrResourcesList({ brandId, type: 1, relationType: 1 })
            this.getVrResourcesList({ brandId, type: 3, relationType: 1 })
        } else if (type === '2') {
            // 商标
            this.getVrResourcesList({ brandId, type: 2, relationType: 2, prodTypeId: prodCategoryId })
            this.getVrResourcesList({ brandId, type: 3, relationType: 2, prodTypeId: prodCategoryId })
        } else if (type === '3') {
            // 美术作品
            this.getVrResourcesList({ brandId, type: 1, relationType: 3 })
            this.getVrResourcesList({ brandId, type: 3, relationType: 3 })
        }
    }

    // 提交确认举报理由、商标
    submitDataToState() {
        let { result, editType } = this.state;
        let { trademarkList, reportReasonList } = this.props;
        let resultData = [], temp = '', key = '';
        if (editType === 'trademark') {
            this.setData(result, 'refChannelId')
            resultData = trademarkList;
            key = 'refChannel';
        } else {
            this.setData(result, 'reportReasonId')
            resultData = reportReasonList;
            key = 'reportReason';
        }
        for (let i = 0; i < resultData.length; i++) {
            const element = resultData[i];
            if (element.id === result) {
                temp = element
            }
        }
        this.setData(temp, key)
        this.setState({
            visibleOperate: false
        })
    }
    
    //取消举报理由、商标
    onCancel() {
        let { editType, result } = this.state
        if (editType === 'trademark') {
            this.setData(result, 'refChannelId')
            this.setState({
                visibleOperate: false,
                result: this.state.refChannelId
            })
        } else {
            this.setState({
                visibleOperate: false,
                result: this.state.reportReasonId
            })
        }
    }

    // 获取资源信息
    getVrResourcesList(data) {
        let { getVrResourcesList, userInfo } = this.props;
        data.userId = userInfo.userId;
        getVrResourcesList(data)
    }

    // 输入数据
    setData(value, key) {
        let type = this.state.type;
        // 如果修改的是商品链接 则重置校验 checkFlag
        if (key === 'prodUrl') {
            this.setState({
                checkFlag: true
            })
        }
        // 如果修改商品类别  则重置举报理由 跟商标
        if (key === 'prodCategoryId' && type === '2') {
            this.setState({
                refChannelId: '',
                refChannel: '',
                reportReasonId: '',
                reportReason: ''
            })
        }
        this.setState({
            [key]: value
        })
    }

    // 删除图片
    deleteShopItemImg(file, fileList, key) {
        if (file) {
            let result = fileList.filter(item => {
                return item.uid !== file.uid
            })
            this.setState({ [key]: result })
        }
    }

    // 上传文件转为字符串
    uploadListToString(data) {
        let result = [];
        if (data.length) {
            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                if (element.response && element.response.success) {
                    result.push(element.response.msgCode)
                }
            }
        }
        return result.toString()
    }

    //提交审核
    submitAudit() {
        let { updateCleanStaticsResultItem, auditbrandCleanProdList, newCleanStatisticsList, intl, brandCleanlinessStatus, reportType, 
            channelList, countCleanConfirm, queryBrandCrawleDetail } = this.props;
        let { type, prodCategoryId, siteToAppear, reportReasonId, reportReasonPhotoList, refChannelId, remark, officialProdPhotoList, officialProdUrl, prodPhotoList, id, checkFlag } = this.state;
        let reportReasonPhoto = this.uploadListToString(reportReasonPhotoList);
        let prodPhoto = this.uploadListToString(prodPhotoList);
        let officialProdPhotoUrl = this.uploadListToString(officialProdPhotoList);
        let data = { id, detailStatus: 4, remark, isTort:1 }
        let reportDetailDO = { reportType: type, prodCategoryId, refChannelId, reportReasonId }
        let reportTypeTemp = getName(reportType, parseInt(reportDetailDO.reportType, 10))
        data.reportTypeName = reportTypeTemp.dictLabel;
        data.reportTypeNameEn = reportTypeTemp.dictLabelEn;
        let detailStatus = getName(brandCleanlinessStatus, data.detailStatus);
        data.detailStatusName = detailStatus.dictLabel;
        data.detailStatusNameEn = detailStatus.dictLabelEn;
        let refChannel = getName(channelList, refChannelId, 'resource');
        if (!checkFlag) {
            message.info(intl.formatMessage({ id: 'report.product.link.is.invalid.please.reenter.it', defaultMessage: '该商品链接无效，请重新输入' }));
        }
        let prodCategory = getName(auditbrandCleanProdList, prodCategoryId, 'prod')
        data.prodCategoryName = prodCategory.name;
        data.prodCategoryNameEn = prodCategory.nameEn;
        if (!prodCategoryId) {
            message.info(intl.formatMessage({ id: 'report.please.select.torts.goods.category', defaultMessage: '请选择侵权商品分类' }));
            return;
        } else if (!reportReasonId) {
            message.info(intl.formatMessage({ id: 'report.please.select.report.reason', defaultMessage: '请选择举报理由' }));
            return;
        }
        if (type === '1') {
            if (!prodPhoto) {
                message.info('请上传侵权商品截图');
                return;
            } else if (!refChannelId) {
                message.info(intl.formatMessage({ id: 'monitor.please.choose.image.of.infringement.channel', defaultMessage: '请选择参照渠道' }));
                return;
            } else if (!officialProdUrl) {
                message.info('请输入官方商品链接');
                return;
            } else if (!officialProdPhotoUrl) {
                message.info('请上传官方商品截图');
                return;
            }
            data.refChannelName = refChannel.vrLabel;
            data.refChannelUrl = refChannel.vrResource;
            reportDetailDO.prodPhoto = prodPhoto;
            reportDetailDO.officialProdUrl = officialProdUrl;
            reportDetailDO.officialProdPhotoUrl = officialProdPhotoUrl;
        } else if (type === '2') {
            if (!siteToAppear) {
                message.info(intl.formatMessage({ id: 'report.please.select.position.of.trademark', defaultMessage: '请选择商标出现位置' }));
                return;
            } else if (!reportReasonPhoto) {
                message.info('请上传举报理由截图');
                return;
            } else if (!refChannelId) {
                message.info(intl.formatMessage({ id: 'monitor.please.choose.image.of.infringement.trademark', defaultMessage: '请选择侵权商标' }));
                return;
            }
            reportDetailDO.siteToAppear = siteToAppear;
            reportDetailDO.reportReasonPhoto = reportReasonPhoto;
        } else if (type === '3') {
            if (!reportReasonPhoto) {
                message.info('请上传举报理由截图');
                return;
            }
            if (!refChannelId) {
                message.info(intl.formatMessage({ id: 'monitor.please.choose.image.of.infringement', defaultMessage: '请选择侵权形象' }));
                return;
            }
            data.refChannelName = `${refChannel.vrLabel}(${refChannel.vrResource})`;
            reportDetailDO.reportReasonPhoto = reportReasonPhoto;
        }
        data.reportDetailDO = reportDetailDO
        if (updateCleanStaticsResultItem) {
            let result = [];
            if (newCleanStatisticsList) {
                result = newCleanStatisticsList;
            }
            updateCleanStaticsResultItem(data, result,()=>{
                //成功后获取已确认待确认数量
                let crawlerDetailId = queryUrlParams('crawlerDetailId')
                let countData={ 
                    crawlerDetailId
                }
                if(countCleanConfirm){
                    countCleanConfirm(countData)
                }
                let crawlerData={ 
                    crawlerDetailId 
                }
                if(queryBrandCrawleDetail){
                    queryBrandCrawleDetail(crawlerData)
                }
            })
        }
    }

    // 取消审核
    cancelAudit() {
        if (this.props.history) {
            this.props.history.goBack()
        }
    }

    checkProdUrl() {
        let { prodUrl, brandId } = this.state;
        let { checkProdUrl } = this.props;
        if (!prodUrl) {
            message.info('请输入商品链接')
        } else {
            this.setState({
                checkFlag: false
            })
            checkProdUrl({ url: prodUrl, brandId: brandId }, () => {
                this.setState({
                    checkFlag: true
                })
            })
        }
    }

    // 获取上传的图片
    getImgSrc(html) {
        let result = [], imgs = [], srcs = [];
        if (html) {
            imgs = html.match(/<img\b.*?(?:>|\/>)/gi);
            if (imgs) {
                for (let i = 0; i < imgs.length; i++) {
                    const element = imgs[i];
                    srcs = element.match(/\bsrc\b\s*=\s*['"]?([^'"]*)['"]?/i);
                    if (srcs) {
                        let data = {
                            type: 'image',
                            response: {
                                success: true,
                                dataObject: srcs[1],
                                msg: "",
                                msgCode: srcs[1]
                            },
                            uid: Date.now() + i
                        }
                        result.push(data)
                    }
                }
            }
        }
        return result;
    }

    // 确认上传
    confirmUpload() {
        let { uploadList, uploadListKey, html } = this.state;
        if (html) {
            let result = this.getImgSrc(html);
            uploadList = uploadList.concat(result);
        }
        this.setData(uploadList, uploadListKey)
        this.cancelUpload()
    }

    // 取消上传
    cancelUpload() {
        // 取消或者确认上传时清空数据
        this.setState({
            uploadVisible: false,
            uploadList: [],
            uploadListKey: '',
            clearImgs: true
        })
    }

    // 显示上传图片弹窗
    showUploadModal(key) {
        // 传入对应的上传数组
        this.setState({
            uploadVisible: true,
            uploadListKey: key,
            uploadList: [].concat(this.state[key]),
            clearImgs: false
        })
    }

    render() {
        let breadcrumbData = [
            { link: '/', titleId: 'router.home', title: '首页' },
            { link: '/brand/list', titleId: 'router.brands.management', title: '品牌管理' },
            { link: '/brand/cleanliness', titleId: 'router.brands.brand.cleanliness', title: '洁净度统计' },
            { link: '', titleId: 'router.brand.cleanliness.statistical.audit', title: '洁净度统计审核' }
        ]
        let {
            brandId, type, platformTypeId, prodUrl, prodCategoryId,
            siteToAppear, reportReason, reportReasonPhotoList, refChannelId, refChannel,
            prodPhotoList, officialProdUrl, officialProdPhotoList, remark, showImg,
            visible, visibleOperate, editType, result, uploadVisible, clearImgs
        } = this.state;
        let { intl, brandList, platfromList, auditbrandCleanProdList, channelList, trademarkList, trademarkPosition, reportReasonList, auditbrandCleanTypeList } = this.props;
        let modalData = editType === 'trademark' ? trademarkList : reportReasonList;
        const tabListNoTitle = [];
        if (auditbrandCleanTypeList) {
            for (let i = 0; i < auditbrandCleanTypeList.length; i++) {
                const element = auditbrandCleanTypeList[i];
                tabListNoTitle.push({
                    tab: intl.locale === 'en' ? element.dictLabelEn : element.dictLabel,
                    key: element.dictVal.toString()
                })
            }
        }
        return (
            <Content breadcrumbData={breadcrumbData} className="monitor-result-audit">
                <Card
                    bordered={false}
                    tabList={tabListNoTitle}
                    activeTabKey={type}
                    onTabChange={key => this.handleChange(key, 'type')}
                >
                    <div className={intl.locale === 'en' ? 'search-form en' : 'search-form'}>
                        {/* 公共 */}
                        <FormItem
                            label={intl.formatMessage({ id: 'report.subordinate.to.the.brand', defaultMessage: '所属品牌', description: '所属品牌' })}
                        >
                            <Select
                                showSearch
                                disabled={true}
                                value={brandId}
                                dropdownMatchSelectWidth={false}
                                onChange={value => this.handleChange(value, 'brandId')}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                placeholder={intl.formatMessage({ id: "monitor.picture.rule.choose.brand", defaultMessage: "请选择所属品牌", description: "请选择所属品牌" })}
                            >
                                {
                                    brandList && brandList.filter(item => item.isDelete === 0)
                                        .map(opt => <SelectOption value={opt.id} key={opt.id}>{opt.name}</SelectOption>)
                                }
                            </Select>
                        </FormItem>
                        <FormItem
                            label={intl.formatMessage({ id: 'report.torts.goods.platform', defaultMessage: '侵权商品平台', description: '侵权商品平台' })}
                        >
                            <Select
                                showSearch
                                disabled={true}
                                value={platformTypeId}
                                dropdownMatchSelectWidth={false}
                                onChange={value => this.setData(value, 'platformTypeId')}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                placeholder={intl.formatMessage({ id: "report.please.select.torts.goods.platform", defaultMessage: "请选择侵权商品平台", description: "请选择侵权商品平台" })}
                            >
                                {
                                    platfromList && platfromList.filter(item => item.isDel === 0)
                                        .map(opt => <SelectOption value={opt.dictVal} key={opt.dictVal}>{intl.locale === 'en' ? opt.dictLabelEn : opt.dictLabel}</SelectOption>)
                                }
                            </Select>
                        </FormItem>
                        <FormItem
                            className='link'
                            label={intl.formatMessage({ id: 'report.torts.goods.link', defaultMessage: '侵权商品链接', description: '侵权商品链接' })}
                        >
                            <a href={prodUrl} target='_blank'>
                                {prodUrl}
                            </a>
                            <a style={{ marginLeft: 15 }} onClick={() => this.checkProdUrl()} ><FormattedMessage id="report.verification.link" defaultMessage="验证链接" description="验证链接" /></a>
                        </FormItem>
                        {
                            type === '1'
                                ? <div className={intl.locale === 'en' ? 'search-form en' : 'search-form'}>
                                    {/* 盗图审核 */}
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.torts.goods.category', defaultMessage: '侵权商品类目', description: '侵权商品类目' })}
                                    >
                                        <Select
                                            showSearch
                                            value={prodCategoryId}
                                            dropdownMatchSelectWidth={false}
                                            onChange={value => this.setData(value, 'prodCategoryId')}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            placeholder={intl.formatMessage({ id: "report.please.select.torts.goods.category", defaultMessage: "请选择侵权商品类目", description: "请选择侵权商品类目" })}
                                        >
                                            {
                                                auditbrandCleanProdList && auditbrandCleanProdList.filter(item => item.isDel === 0)
                                                    .map(opt => <SelectOption value={opt.id} key={opt.id}>{intl.locale === 'en' ? opt.nameEn : opt.name}</SelectOption>)
                                            }
                                        </Select>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.with.reference.to.channel', defaultMessage: '参照渠道', description: '参照渠道' })}
                                    >
                                        <ul className="channel-list clearfix">
                                            {
                                                channelList && channelList.filter(item => item.isDel === 0)
                                                    .map(opt => (
                                                        <li className={opt.id === refChannelId ? 'channel-item active' : 'channel-item'} onClick={() => this.setData(opt.id, 'refChannelId')} key={opt.id}>
                                                            <p>{opt.vrLabel}</p>
                                                            <p>{opt.vrResource}</p>
                                                        </li>
                                                    ))
                                            }
                                        </ul>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.report.reason', defaultMessage: '举报理由', description: '举报理由' })}
                                    >
                                        {
                                            reportReason !== ''
                                                ? <Input style={{ marginRight: 10 }} value={reportReason.vrLabel} disabled />
                                                : ''
                                        }
                                        <a onClick={() => this.setState({ visibleOperate: true, editType: 'reason' })}>选择</a>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.torts.goods.screenshots', defaultMessage: '侵权商品截图', description: '侵权商品截图' })}
                                    >
                                        <a onClick={() => this.showUploadModal('prodPhotoList')}>
                                            <Icon type='upload' />
                                            <FormattedMessage id="case.upload.img" defaultMessage="上传图片" description="上传图片" />
                                        </a>
                                        <UploadList
                                            deleteImg={(file) => this.deleteShopItemImg(file, prodPhotoList, 'prodPhotoList')}
                                            onPreview={(file) => this.setState({ visible: true, showImg: file.response.dataObject.replace(/_/, '') })}
                                            fileList={prodPhotoList}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.links.to.official.merchandise.or.images', defaultMessage: '官方商品/图片链接', description: '官方商品/图片链接' })}
                                    >
                                        <Input
                                            value={officialProdUrl}
                                            onChange={e => this.setData(e.target.value, 'officialProdUrl')}
                                            placeholder={intl.formatMessage({ id: "report.please.enter.links.to.official.merchandise.or.images", defaultMessage: "请输入官方商品/图片链接", description: "请输入官方商品/图片链接" })}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.official.merchandise.or.picture.screenshots', defaultMessage: '官方商品/图片截图', description: '官方商品/图片截图' })}
                                    >
                                        <a onClick={() => this.showUploadModal('officialProdPhotoList')}>
                                            <Icon type='upload' />
                                            <FormattedMessage id="case.upload.img" defaultMessage="上传图片" description="上传图片" />
                                        </a>
                                        <UploadList
                                            deleteImg={(file) => this.deleteShopItemImg(file, officialProdPhotoList, 'officialProdPhotoList')}
                                            onPreview={(file) => this.setState({ visible: true, showImg: file.response.dataObject.replace(/_/, '') })}
                                            fileList={officialProdPhotoList}
                                        />
                                    </FormItem>
                                </div>
                                : ''
                        }
                        {
                            type === '2'
                                ? <div className={intl.locale === 'en' ? 'search-form en' : 'search-form'}>
                                    {/* 商标审核 */}
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.torts.goods.category', defaultMessage: '侵权商品类目', description: '侵权商品类目' })}
                                    >
                                        <Select
                                            showSearch
                                            value={prodCategoryId}
                                            dropdownMatchSelectWidth={false}
                                            onChange={value => this.handleChange(value, 'prodCategoryId')}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            placeholder={intl.formatMessage({ id: "report.please.select.torts.goods.category", defaultMessage: "请选择侵权商品类目", description: "请选择侵权商品类目" })}
                                        >
                                            {
                                                auditbrandCleanProdList && auditbrandCleanProdList.filter(item => item.isDel === 0)
                                                    .map(opt => <SelectOption value={opt.id} key={opt.id}>{intl.locale === 'en' ? opt.nameEn : opt.name}</SelectOption>)
                                            }
                                        </Select>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.torts.trademark', defaultMessage: '侵权商标', description: '侵权商标' })}
                                    >
                                        {
                                            refChannel !== ''
                                                ? <Input style={{ marginRight: 10 }} value={refChannel.description} disabled />
                                                : ''
                                        }
                                        <a onClick={() => this.setState({ visibleOperate: true, editType: 'trademark', result: refChannel.id })}>选择</a>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.position.of.trademark', defaultMessage: '商标出现位置', description: '商标出现位置' })}
                                    >
                                        <Select
                                            showSearch
                                            value={siteToAppear}
                                            dropdownMatchSelectWidth={false}
                                            onChange={value => this.setData(value, 'siteToAppear')}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            placeholder={intl.formatMessage({ id: "report.please.select.position.of.trademark", defaultMessage: "请选择商标出现位置", description: "请选择商标出现位置" })}
                                        >
                                            {
                                                trademarkPosition && trademarkPosition.filter(item => item.isDel === 0)
                                                    .map(opt => <SelectOption value={opt.dictVal} key={opt.dictVal} >{intl.locale === 'en' ? opt.dictLabelEn : opt.dictLabel}</SelectOption>)
                                            }
                                        </Select>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.report.reason', defaultMessage: '举报理由', description: '举报理由' })}
                                    >
                                        {
                                            reportReason !== ''
                                                ? <Input style={{ marginRight: 10 }} value={reportReason.vrLabel} disabled />
                                                : ''
                                        }
                                        <a onClick={() => this.setState({ visibleOperate: true, editType: 'reason', result: reportReason.id })}>选择</a>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.screenshot.of.reasons.for.reporting', defaultMessage: '举报理由截图', description: '举报理由截图' })}
                                    >
                                        <a onClick={() => this.showUploadModal('reportReasonPhotoList')}>
                                            <Icon type='upload' />
                                            <FormattedMessage id="case.upload.img" defaultMessage="上传图片" description="上传图片" />
                                        </a>
                                        <UploadList
                                            deleteImg={(file) => this.deleteShopItemImg(file, reportReasonPhotoList, 'reportReasonPhotoList')}
                                            onPreview={(file) => this.setState({ visible: true, showImg: file.response.dataObject })}
                                            fileList={reportReasonPhotoList}
                                        />
                                    </FormItem>
                                </div>
                                : ''
                        }
                        {
                            type === '3'
                                ? <div className={intl.locale === 'en' ? 'search-form en' : 'search-form'}>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.torts.goods.category', defaultMessage: '侵权商品类目', description: '侵权商品类目' })}
                                    >
                                        <Select
                                            showSearch
                                            value={prodCategoryId}
                                            dropdownMatchSelectWidth={false}
                                            onChange={value => this.setData(value, 'prodCategoryId')}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                            placeholder={intl.formatMessage({ id: "report.please.select.torts.goods.category", defaultMessage: "请选择侵权商品类目", description: "请选择侵权商品类目" })}
                                        >
                                            {
                                                auditbrandCleanProdList && auditbrandCleanProdList.filter(item => item.isDel === 0)
                                                    .map(opt => <SelectOption value={opt.id} key={opt.id}>{intl.locale === 'en' ? opt.nameEn : opt.name}</SelectOption>)
                                            }
                                        </Select>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'monitor.image.of.infringement', defaultMessage: '侵权形象', description: '侵权形象' })}
                                    >
                                        <ul className="channel-list clearfix">
                                            {
                                                channelList && channelList.filter(item => item.isDel === 0)
                                                    .map(opt => (
                                                        <li className={opt.id === refChannelId ? 'channel-item active' : 'channel-item'} onClick={() => this.setData(opt.id, 'refChannelId')} key={opt.id}>
                                                            <p>{opt.vrLabel}</p>
                                                            <p>{opt.vrResource}</p>
                                                        </li>
                                                    ))
                                            }
                                        </ul>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.report.reason', defaultMessage: '举报理由', description: '举报理由' })}
                                    >
                                        {
                                            reportReason !== ''
                                                ? <Input style={{ marginRight: 10 }} value={reportReason.vrLabel} disabled />
                                                : ''
                                        }
                                        <a onClick={() => this.setState({ visibleOperate: true, editType: 'reason' })}>选择</a>
                                    </FormItem>
                                    <FormItem
                                        label={intl.formatMessage({ id: 'report.screenshot.of.reasons.for.reporting', defaultMessage: '举报理由截图', description: '举报理由截图' })}
                                    >
                                        <a onClick={() => this.showUploadModal('reportReasonPhotoList')}>
                                            <Icon type='upload' />
                                            <FormattedMessage id="case.upload.img" defaultMessage="上传图片" description="上传图片" />
                                        </a>
                                        <UploadList
                                            deleteImg={(file) => this.deleteShopItemImg(file, reportReasonPhotoList, 'reportReasonPhotoList')}
                                            onPreview={(file) => this.setState({ visible: true, showImg: file.response.dataObject })}
                                            fileList={reportReasonPhotoList}
                                        />
                                    </FormItem>
                                </div>
                                : ''
                        }
                        {/* 公共 */}
                        <FormItem
                            className='remark'
                            label={intl.formatMessage({ id: 'report.note', defaultMessage: '备注', description: '备注' })}
                        >
                            <TextArea
                                value={remark}
                                rows={6}
                                onChange={e => this.setData(e.target.value, 'remark')}
                                placeholder={intl.formatMessage({ id: "report.please.enter.note", defaultMessage: "请输入备注信息", description: "请输入备注信息" })}
                            />
                        </FormItem>
                        <div className="btns">
                            <Button
                                type='primary'
                                onClick={() => this.submitAudit()}
                            >
                                <FormattedMessage id="global.determine" defaultMessage="确定" description="确定" />
                            </Button>
                            <Button
                                onClick={() => this.cancelAudit()}
                            >
                                <FormattedMessage id="global.cancel" defaultMessage="取消" description="取消" />
                            </Button>
                        </div>
                    </div>
                </Card>
                <Modal
                    title={
                        editType === 'trademark'
                            ? intl.formatMessage({ id: "monitor.choose.trademark", defaultMessage: "选择商标", description: "选择商标" })
                            : intl.formatMessage({ id: "monitor.choose.reason", defaultMessage: "选择理由", description: "选择理由" })
                    }
                    width='880px'
                    visible={visibleOperate}
                    onOk={() => this.submitDataToState()}
                    onCancel={() => this.onCancel()}
                    className='monitor-result-audit'
                >
                    <div className='modal-info'>
                        <RadioGroup
                            value={result}
                            onChange={e => this.setData(e.target.value, 'result')}
                        >
                            {
                                modalData && modalData.map(opt => (
                                    <Radio key={opt.id} value={opt.id} >
                                        {
                                            opt.vrResource
                                                ? (
                                                    <div className="radio-img">
                                                        <img src={opt.vrResource} alt={opt.typeName} onClick={() => this.setState({ visible: true, showImg: opt.vrResource.replace('/_', '/') })} />
                                                    </div>
                                                )
                                                : (
                                                    <div className="radio-title">
                                                        {
                                                            opt.type !== 2
                                                                ? opt.vrLabel.length > 7
                                                                    ? (
                                                                        <Tooltip title={opt.vrLabel}>
                                                                            {opt.vrLabel.slice(0, 9)}
                                                                        </Tooltip>
                                                                    )
                                                                    : opt.vrLabel
                                                                : opt.description
                                                        }
                                                    </div>
                                                )
                                        }
                                    </Radio>
                                ))
                            }
                        </RadioGroup>
                    </div>
                </Modal>
                <Modal
                    visible={uploadVisible}
                    title={intl.formatMessage({ id: 'case.upload.img', defaultMessage: '上传图片', description: '上传图片' })}
                    onOk={() => this.confirmUpload()}
                    onCancel={() => this.cancelUpload()}
                    width="70%"
                >
                    <Edit
                        name='upload'
                        menus={[]}
                        clear={clearImgs}
                        onChange={html => this.setState({ html })}
                    />
                </Modal>
                <PictureModal
                    showImg={showImg}
                    visible={visible}
                    onCancel={() => this.setState({ visible: false, showImg: '' })}
                />
            </Content>
        )
    }
}
