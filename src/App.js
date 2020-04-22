/*global chrome*/

import React, { useState, useEffect, useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components'
import 'moment/locale/ja'
import moment from 'moment-timezone';

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > * + * {
        padding-left: 10px
    }
`

const GlobalStyle = createGlobalStyle`
    body {
        width: auto;
        padding: 5px;
        white-space: nowrap;
    }
`

const filterDate = (today, items) => Object.values(
    items.sort((a, b) => b.lastVisitTime - a.lastVisitTime)
        .reduce((p, c) => {
            p[c.title] = p[c.title] || c
            return p
        }, {}))
    .filter(v => today.isSame(moment(v.lastVisitTime), 'day'))
    .sort((a, b) => b.lastVisitTime - a.lastVisitTime)

const copyToClipBoard = str => navigator.clipboard.writeText(str)


export const Contents = ({ items, onCopy }) => {
    const displayItems = filterDate(moment(), items)
    const [choice, setChoice] = useState(new Array(displayItems.length).fill(true))
    const onClick = useCallback(() => {
        onCopy(displayItems.filter((_, i) => choice[i]).map(v => v.title).join('\n'))
    }, [JSON.stringify(displayItems), JSON.stringify(choice)])

    const onCheck = useCallback(e => {
        choice[e.target.dataset.id] = !choice[e.target.dataset.id]
        console.dir(choice)
        setChoice([...choice])
    }, [JSON.stringify(choice)])

    return <>
        <Row>
            <button onClick={onClick}>Copy</button>
            <div>{moment().format('YYYY/MM/DD')}</div>
        </Row>

        {
            displayItems.map((v, i) => (
                <Row key={i}>
                    <label>
                        <input type="checkbox" data-id={i} checked={choice[i]} onChange={onCheck}/>
                        {v.title}
                    </label>
                    <div>{moment(v.lastVisitTime).tz('Asia/Tokyo').format('HH:mm:ss')}</div>
                </Row>
            ))
        }
    </>
}

const App = () => {
    const [itemList, setItemList] = useState([])

    useEffect(() => {
        chrome.history.search({ text: 'https://www.google.com/?search' }, results => {
            setItemList(results)
        })
    }, [])

    return <>
        <GlobalStyle />
        {
            itemList.length > 0 && <Contents items={itemList} onCopy={copyToClipBoard} />
        }
    </>
}

export default App;
