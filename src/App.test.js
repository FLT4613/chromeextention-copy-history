import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { Contents as OriginalComponent } from './App';

const OriginalDate = Date.now
const onCopy = jest.fn()
const Contents = props => <OriginalComponent onCopy={props.onCopy || onCopy} {...props} />

beforeEach(() => {
    Date.now = jest.fn(() => Date.parse('2020-04-02'))
});

afterEach(() => {
    Date.now = OriginalDate
    onCopy.mockClear()
});

describe('表示', () => {
    test('時間は日本時間で、"HH:mm:ss"の形式で表示される', () => {
        const data = [{
            title: 'Title',
            lastVisitTime: 1585753200000.0000
        }]
        const { queryByText } = render(<Contents items={data} />);
        expect(queryByText('00:00:00')).toBeInTheDocument()
    })

    test('その日分の履歴が表示される', () => {
        const data = [{
            title: 'Title',
            lastVisitTime: 1585580400000.0000
        }, {
            title: 'Title',
            lastVisitTime: 1585720799000.0000
        }, {
            title: 'Title',
            lastVisitTime: 1585753200000.0000
        }]
        const { queryAllByText } = render(<Contents items={data} />);
        expect(queryAllByText('00:00:00').length).toBe(1)
    })

    test('同じタイトルの履歴は新しい側のみ表示', async () => {
        const data = [{
            title: 'Title2',
            lastVisitTime: 1585753400000.0000
        }, {
            title: 'Title1',
            lastVisitTime: 1585753200000.0000
        }, {
            title: 'Title2',
            lastVisitTime: 1585753200000.0000
        }, {
            title: 'Title2',
            lastVisitTime: 1585753200000.0000
        }]
        const { queryAllByText } = render(<Contents items={data} />);
        const list = queryAllByText(/Title/).map(v => v.textContent)
        expect(list).toEqual(['Title2', 'Title1'])
    })
})


describe('クリップボード', () => {
    test('Copyボタン押下でクリップボードに格納', () => {
        const data = [{
            title: 'Title3',
            lastVisitTime: 1585753200000.0000
        }, {
            title: 'Title4',
            lastVisitTime: 1585753200001.0000
        }]
        const { getByText } = render(<Contents items={data} />);
        fireEvent.click(getByText('Copy'))
        expect(onCopy.mock.calls).toEqual([['Title4\nTitle3']])
    })
    test('チェックを外したものはコピーしない', () => {
        const data = [{
            title: 'Title3',
            lastVisitTime: 1585753200000.0000
        }, {
            title: 'Title4',
            lastVisitTime: 1585753200001.0000
        }]
        const { getByText } = render(<Contents items={data} />);
        fireEvent.click(getByText('Title3'))
        fireEvent.click(getByText('Copy'))
        expect(onCopy.mock.calls).toEqual([['Title4']])
    })
})
