export function filterTableColumns() {
    return [{
        type: 'selection',
        align: 'center',
        minWidth: 70,
        maxWidth: 70,
        fixed: 'left'
    }, {
        title: '序号',
        type: 'index',
        align: 'center',
        sortable: true,
        minWidth: 100,
        maxWidth: 100,
        fixed: 'left'
    }, {
        title: '标识',
        key: 'title',
        align: 'center',
        sortable: true,
        minWidth: 150,
        maxWidth: 200,
        fixed: 'left'
    }, {
        title: '内容',
        key: 'value',
        align: 'center',
        sortable: true,
        minWidth: 200,
        maxWidth: 300
    }, {
        title: '完整引用',
        key: 'fullKey',
        align: 'center',
        sortable: true,
        minWidth: 400,
        maxWidth: 500
    }, {
        title: '文件位置',
        key: 'path',
        align: 'center',
        sortable: true,
        minWidth: 500
    }, {
        title: '引用状态',
        key: 'state',
        align: 'center',
        sortable: true,
        minWidth: 120,
        maxWidth: 150,
        fixed: 'right',
        render: (h, {
            row
        }) => {
            const type = row.state ? 'md-checkmark' : 'md-close';
            const color = row.state ? '#19be6b' : '#ed4014';
            return (<icon type = {type} color = {color}></icon>);
        }
    }]
}
