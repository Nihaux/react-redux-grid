import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import ActionColumn from '../plugins/gridactions/ActionColumn.jsx';
import DragAndDropManager from '../core/draganddrop/DragAndDropManager';
import { keyGenerator, keyFromObject } from '../../util/keygenerator';
import { prefix } from '../../util/prefix';
import { emptyFn } from '../../util/emptyFn';
import { CLASS_NAMES } from '../../constants/GridConstants';
import { resizeColumn } from '../../actions/core/ColumnManager';

class Header extends Component {

    static defaultProps = {
        columnManager: React.PropTypes.object.isRequired,
        columns: React.PropTypes.arrayOf(React.PropTypes.Object).isRequired,
        plugins: React.PropTypes.object,
        store: React.PropTypes.func
    }

    isColumnResizable(col, columnManager) {

        if (col.resizable !== undefined) {
            return col.resizable;
        }

        else if (columnManager.config.resizable !== undefined) {
             return columnManager.config.resizable;
        }

        else {
            return columnManager.config.defaultResizable;
        }
    }

    handleDrag(id, columnManager, store, reactEvent) {
        const mousePosition = reactEvent.pageX;
        const header = reactEvent.target.parentElement.parentElement;
        const columnNode = reactEvent.target.parentElement;
        const columnOffsetLeft = columnNode.getBoundingClientRect().left;
        const headerWidth = parseInt(window.getComputedStyle(header).width, 10);
        const computedWidth = (mousePosition - columnOffsetLeft) / headerWidth;
        const width = computedWidth * 100;

        if (width > columnManager.config.minColumnWidth) {
            store.dispatch(resizeColumn(width, id));
        }
    }

    handleColumnClick(col, reactEvent) {

        if (col.HANDLE_CLICK) {
            col.HANDLE_CLICK.apply(this, arguments);
        }
    }

    getDragHandle(col, dragAndDropManager) {
        const handleProps = dragAndDropManager.initDragable({}, col);

        return (
            <span { ...handleProps } />
        );
    }

    getHeader(col, columnStates, dragAndDropManager) {

        const { columnManager, selectionModel, store } = this.props;

        const isResizable = this.isColumnResizable(col, columnManager);

        const dragHandle = isResizable 
            ? this.getDragHandle(col, dragAndDropManager) : null;

        const key = keyGenerator(col.name, col.value);

        const draggedWidth = columnStates && columnStates[key] ? `${columnStates[key].width}%` : null;

        const headerProps = {
            className: `${col.className} ${isResizable ? prefix("resizable") : ""}`,
            onClick: this.handleColumnClick.bind(this, col),
            onDrag: this.handleDrag.bind(this, key, columnManager, store),
            key,
            style: {
                width: draggedWidth ? draggedWidth : (col.width || columnManager.config.defaultColumnWidth)
            }
        };

        const innerHTML = col.renderer ? col.renderer(col) : col.name;

        return (
            <th { ...headerProps } >
                { innerHTML }
                { dragHandle }
            </th>
        );
    }

    getAdditionalClasses() {

    }

    render() {

        const { columns, selectionModel, columnManager, columnStates } = this.props;
        const dragAndDropManager = new DragAndDropManager();
        const headers = columns.map((col) => this.getHeader(col, columnStates, dragAndDropManager));
        const headerProps = {
            className: prefix(CLASS_NAMES.HEADER)
        }

        selectionModel.updateCells(headers, columns);

        columnManager.addActionColumn(headers, 'header');

        return (
            <thead>
                <tr { ...headerProps }>
                    { headers }
                </tr>
            </thead>
        );
    }
}

function mapStateToProps(state) {
    return {
        columnStates: state.columnManager.get('columnStates')
    };
}

export default connect(mapStateToProps)(Header);