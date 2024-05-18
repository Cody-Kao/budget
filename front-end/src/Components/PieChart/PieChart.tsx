import React from 'react'
import Stack from '@mui/material/Stack';
import {Stack as StackBS} from 'react-bootstrap';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { PieChart as PC, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import SearchOffIcon from '@mui/icons-material/SearchOff';

import { Modal } from 'react-bootstrap'
import { budgetObject, useBudget } from '../../Context/BudgetAndExpense/BudgetAndExpense';
import { PieSeriesType, PieValueType } from '@mui/x-charts';
import { MakeOptional } from '@mui/x-charts/models/helpers';
import { currencyFormatter, dateFormatter, floatToPercentage } from '../../utils';

type PieChartProps = {
    show:boolean 
    handleClose:() => void
}

type PieChartElement = {
    label:string 
    value:number
}

const colors = [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#ffff99',
    '#b15928',
]

export default function PieChart({show, handleClose}:PieChartProps) {
    const [curBudget, setCurBudget] = React.useState<budgetObject>();
    const {budgets, expenses} = useBudget() || {}
    const initCY = 290 + Math.round(budgets!.length / 12)*20 // 隨著越來越多的項目去動態調整y的定位
    const initHeight = 530 + Math.round(budgets!.length / 12)*20 // 隨著越來越多的項目去動態調整高度
    const totalExpense = expenses?.reduce((total, expense) => total + expense.amount, 0)

    const expensesData = budgets?.map(budget => {
        return {label:budget.name, value:expenses!.reduce((total, expense) => {
                return expense.budgetID === budget.id ? total + expense.amount : total + 0}, 0)
            }
    })
    const series = [
        {
            arcLabel: (item:PieChartElement) => `${floatToPercentage(item.value / totalExpense!)}`,
            arcLabelMinAngle: 8, // 角度小於8就不顯示label
            innerRadius: 0,
            outerRadius: 200,
            data: expensesData,
            cy:initCY // 圓餅圖從y為多少開始定位，為了確保不擋到legend用的
        }
    ]
        
    ;
    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>統計圖表</Modal.Title>
            </Modal.Header>
            <Modal.Body className='d-flex gap-2' style={{height:initHeight}}>
                <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 0, ms: 4 }}
                sx={{ width: '100%'}}
                >
                {    
                expenses!.length === 0 ? <span>目前沒有花費可以顯示</span>:
                    <Box sx={{ flexGrow: 1 }}>
                        <PC
                        series={series as unknown as MakeOptional<PieSeriesType<MakeOptional<PieValueType, "id">>, "type">[]}
                        sx={{
                            [`& .${pieArcLabelClasses.root}`]: {
                                fill: 'white',
                                fontWeight: 'bold',
                            },
                        }}
                        width={500}
                        slotProps={{
                            legend: { 
                                direction: 'row',
                                position: { vertical: 'top', horizontal: 'left' },
                                padding: 0,
                            },
                        }}
                        colors={colors}
                        // portion是指Pie中的每一塊，裡面有個dataIndex是指第幾塊，剛好對應的是budgets的index
                        // 所以我們使用該index找到該budget，並把budget.id設定到state之中，以找尋、顯示expense
                        onItemClick={(_, portion) => setCurBudget(budgets![portion.dataIndex])}
                        />
                        
                    </Box>
                
                }
                </Stack>
                <Stack direction="column" sx={{ width: { xs: '100%', md: '55%' } }}>
                    <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                    >
                        <Typography variant='h5'>點擊圖表查看<span className='fw-bold'>-{curBudget?.name}</span></Typography>
                        <IconButton
                            aria-label="reset"
                            size="small"
                            color='primary'
                            onClick={() => {
                            setCurBudget(undefined);
                            }}
                        >
                            <SearchOffIcon/>
                        </IconButton>
                    </Box>
                    <hr className="hr" />
                    <Stack direction='column' gap={3} sx={{ overflowY: 'auto', maxHeight: '100%' }}>
                        {
                            expenses?.filter(expense => expense.budgetID === curBudget?.id)
                            .map(exp => {
                                return (
                                    <StackBS key={exp.id} direction='horizontal' gap={2} style={{marginRight:"5px"}}>
                                        <div className="me-auto fs-5">{exp.description.length > 5 ? exp.description.slice(0, 5)+"..." : exp.description}</div>
                                        <div className='fw-light' style={{fontSize:".8rem"}}>{dateFormatter(exp.date)}</div>
                                        <div className="fs-5">{currencyFormatter.format(exp.amount)}</div>
                                    </StackBS>
                                    
                                )
                            })
                        }
                    </Stack>
                </Stack>
            </Modal.Body>
        </Modal>
    )
}
