import {
    Box,
    Button, Slider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import AppStyle from "./App.module.scss"
import Turntable from "./components/turntable.tsx";
import {useEffect, useState} from "react";
import {exists, BaseDirectory, readFile} from "@tauri-apps/plugin-fs";
import { confirm } from '@tauri-apps/plugin-dialog';
import {getCurrentWindow} from "@tauri-apps/api/window";

const chance = new (await import("chance")).Chance()

export type singleElement = {
    id: number,
    name: string,
    chance: number,
    color: string,
    startDegree: number,
    endDegree: number
    description: string | undefined,
    limitation: number,
}

type Table = {
    id: number,
    elementList: singleElement[],
    selectedPrize: number,
    selectHistory: number[]
}

export default function App() {
    // const [history] = useState<number[]>(new Array<number>(800).fill(0))
    const [table, setTable] = useState<Table[]>([
        {
            id: 1,
            elementList: [{id: 1, name: "Loading", chance: 1, description: undefined, startDegree: 0, endDegree: 2*Math.PI, color: "#666666", limitation: 0}],
            selectedPrize: 0,
            selectHistory: []
        }
    ])

    const [selectTable, setSelectTable] = useState(1)

    const [isTurning, setIsTurning] = useState(false)

    const [rotate, setRotate] = useState(0)
    const [colorList] = useState(new Colors())

    useEffect(() => {
        processCSV(10).then()
    }, []);

    useEffect(() => {
        const window = getCurrentWindow();

        window.onCloseRequested(async (event) => {
            event.preventDefault()
            const confirmed = await confirm("Sure? O.O")
            if (confirmed) {
                await window.destroy();
            }
        }).then()
    }, []);

    async function processCSV(num: number) {
        const eList: Table[] = []
        for (let i = 1; i <= num; i++) {
            await exists(`ext_${i}.csv`, {baseDir: BaseDirectory.AppLocalData}).then(
                async (e) => {
                    if (e) {
                        setRotate(0)

                        const list: singleElement[] = [];

                        const rawContent = new TextDecoder('gbk').decode(await readFile(`ext_${i}.csv`, {baseDir: BaseDirectory.AppLocalData}))

                        // const parsed: [] = parse(rawContent)
                        const parsed: string[][] = []

                        rawContent.split("\n").forEach((e)=>{
                            const list = e.replace("\r", "").split(",")
                            console.log(list)
                            if (list.length >= 3) {
                                const tempList = [list.shift(),list.shift(),list.shift(),list.join(", ")];
                                parsed.push(tempList as string[])
                            }
                        })

                        let totalChance = 0;

                        parsed.forEach(
                            (e)=>{
                                totalChance += Number(e[1])
                            }
                        )
                        // @ts-expect-error Must Work
                        let startDegree = -90-(parsed[0][1]*180/totalChance)

                        parsed.forEach(
                            (e, i)=>{
                                list.push({
                                    id: i+1,
                                    name: e[0],
                                    chance: Number(e[1]),
                                    color: colorList.nextColor(),
                                    startDegree: startDegree,
                                    endDegree: startDegree + Number(e[1]) * 360 / totalChance,
                                    limitation: Number(e[2]),
                                    description: e[3]
                                })
                                startDegree += Number(e[1]) * 360 / totalChance
                            }
                        )

                        eList.push({
                            id: i,
                            elementList: list,
                            selectedPrize: 0,
                            selectHistory: []
                        })
                    } else {
                        eList.push({
                            id: i,
                            elementList: [
                                {
                                    id: 1,
                                    name: "未找到文件",
                                    chance: 1,
                                    color: "#666666",
                                    limitation: 0,
                                    startDegree: 0,
                                    endDegree: 360,
                                    description: `AppData/Local/lachesis/ext_${i}.csv`
                                }
                            ],
                            selectedPrize: 0,
                            selectHistory: []
                        })
                    }
                }
            )
        }
        setTable(eList)
    }

    function turnTurnTable() {
        setRotate(0)
        setIsTurning(true)

        setTimeout(() => {
            for (const e of table[selectTable - 1].elementList) {
                if (e.limitation < 0 || e.limitation > 0) {
                    for (let i = 0; i < 1000000 ; i++) {
                        const degree = chance.floating({min: 0, max: 360});

                        for (const e1 of table[selectTable - 1].elementList) {
                            if (((e1.startDegree < degree - 90) && (e1.endDegree > degree - 90)) || ((e1.startDegree < degree - 90 - 360) && (e1.endDegree > degree - 90 - 360))) {
                                console.log(e1.limitation < 0, e1.limitation > 0)
                                if (e1.limitation < 0 || e1.limitation > 0) {
                                    setRotate(-degree - 1440)
                                    const tempTable = structuredClone(table);
                                    tempTable[selectTable - 1] = {...table[selectTable - 1], selectedPrize: e1.id}
                                    setTimeout(() => {
                                        setTable(tempTable)
                                        e1.limitation -= 1;
                                    }, 5000)
                                    setTimeout(()=>setIsTurning(false), 5000)
                                    return;
                                }
                            }
                        }
                    }
                }
            }
            setIsTurning(false)
        },
        200)

        // for (let i = 0; i< 2000000; i++) {
        //     const degree = chance.floating({min: 0, max: 360});
        //
        //     elementList.forEach(
        //         (e) => {
        //             if ((e.startDegree < degree-90) && (e.endDegree > degree-90)) {
        //                 history[e.id-1] += 1
        //             }else
        //             if ((e.startDegree < degree-90-360) && (e.endDegree > degree-90-360)) {
        //                 history[e.id-1] += 1
        //             }
        //         }
        //     )
        // }
    }

    return <Box
        display={"flex"}
        // flexDirection={"column"}
    >
        <Box display={"flex"} flexDirection={"column"}>
            <Box
                className={"turntable"}
                width={600}
                height={800}
                marginX={"auto"}
            >
                <Turntable width={600} height={800}
                           rotateDegree={rotate}
                           elementList={table[selectTable-1].elementList}></Turntable>
            </Box>
            <Box id={"user-ui"}
                 marginX={"auto"}
                 display={"flex"}
                 flexDirection={"column"}
            >
                <Button
                    className={`${AppStyle.startButton}`}
                    onClick={turnTurnTable}
                    disabled={isTurning}
                >
                    抽奖
                </Button>
                <Box
                    width={240}
                    marginX={"auto"}
                    display={"flex"}
                >
                    <Slider
                        disabled={isTurning}
                        defaultValue={1}
                        value={selectTable}
                        step={1}
                        min={1}
                        max={10}
                        marks
                        onChange={(_e, v)=>{setSelectTable(v as number)}}
                    />
                </Box>
                <Box marginX={"auto"}>
                    {table[selectTable-1].selectedPrize ? table[selectTable-1].elementList[table[selectTable-1].selectedPrize - 1].name : ""}
                </Box>
            </Box>
        </Box>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow selected={true}>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Chance</TableCell>
                        <TableCell>Left</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        table[selectTable-1].elementList.map((row, i) => {
                            return <TableRow key={i} selected={i + 1 === table[selectTable-1].selectedPrize}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell>{row.chance}</TableCell>
                                <TableCell>{row.limitation < 0 ? "Infinity" : row.limitation === 0 ? "Out" : row.limitation}</TableCell>
                            </TableRow>
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </Box>;

}

class Colors {
    private readonly colors: string[]
    private arrow: number

    constructor() {
        this.colors = [
            '#FF5733',
            '#FFC300',
            '#DAF7A8',
            '#90EE90',
            '#81D8D0',
            '#6495ED',
            '#007BFF',
            '#A020F0',
            '#E278E2',
            '#FF69B4',
            '#CD5C5C',
            '#FA8072',
            '#D2B48C',
            '#A9A9A9',
            '#FFFF00',
            '#E6E6FA',
            '#F4A460',
            '#FFD700',
            '#228B22',
            '#00FFFF',
            '#800000',
        ]
        this.arrow = 0
    }

    nextColor() {
        const color = this.colors[this.arrow]
        if (this.arrow === this.colors.length - 1) {
            this.arrow = 0
        } else {
            this.arrow++
        }

        return color
    }
}