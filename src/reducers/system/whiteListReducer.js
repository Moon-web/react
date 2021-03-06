import { GET_WHITE_LIST_SUCCESS } from '../../contants/system/whiteListTypes'

export default function (state = {}, action) {
    switch (action.type) {
        case GET_WHITE_LIST_SUCCESS:
            return Object.assign({}, state, {
                isFetch: action.isFetch,
                oldWhiteList: action.oldWhiteList,
                newWhiteList: action.newWhiteList,
                searchData: action.searchData,
                pageNo: action.pageNo !== undefined ? action.pageNo : state.pageNo,
                pageSize: action.pageSize !== undefined ? action.pageSize : state.pageSize,
                total: action.total !== undefined ? action.total : state.total,
            }) 
        default:
            return state
    }
}