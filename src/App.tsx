import {Box, Button, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import AppStyle from "./App.module.scss"
import Turntable from "./components/turntable.tsx";
import {useEffect, useState} from "react";
import {exists, BaseDirectory, readTextFile} from "@tauri-apps/plugin-fs";

const chance = new (await import("chance")).Chance()

export type singleElement = {
    id: number,
    name: string,
    chance: number,
    color: string,
    startDegree: number,
    endDegree: number
    description: string | undefined,
}

export default function App() {
    // const [history] = useState<number[]>(new Array<number>(800).fill(0))

    const [isTurning, setIsTurning] = useState(false)

    const [rotate, setRotate] = useState(0)
    const [colorList] = useState(new Colors())

    const [elementList, setElementList] = useState<singleElement[]>([{id: 1, name: "Loading", chance: 1, description: undefined, startDegree: 0, endDegree: 2*Math.PI, color: "#666666"}])

    const [selectedPrize, setSelectedPrize] = useState(0)

    useEffect(() => {
        setDefaultCSV()
    }, []);

    function setDefaultCSV() {
        processCSV("default.csv")
    }

    function setSecondCSV() {
        processCSV("second.csv")
    }

    function processCSV(name: string) {
        exists(name, {baseDir: BaseDirectory.AppLocalData}).then(
            async (e) => {
                if (e) {
                    const list: singleElement[] = [];

                    const rawContent = await readTextFile(name, {baseDir: BaseDirectory.AppLocalData})

                    // const parsed: [] = parse(rawContent)
                    const parsed: string[][] = []

                    rawContent.split("\r\n").forEach((e)=>{
                        const list = e.split(",")
                        if (list.length===2) {
                            parsed.push(list)
                            console.log(list)
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
                                description: e[2]
                            })
                            startDegree += Number(e[1]) * 360 / totalChance
                        }
                    )

                    setElementList(list)
                } else {
                    setElementList(
                        [
                            {
                                id: 1,
                                name: "未找到文件",
                                chance: 1,
                                color: "#666666",
                                startDegree: 0,
                                endDegree: 2*Math.PI,
                                description: "AppData/Local/lachesis/default.csv"
                            }
                        ]
                    )
                }
            }
        )
    }

    function turnTurnTable() {
        setRotate(0)
        setIsTurning(true)

        setTimeout(()=>{
            const degree = chance.floating({min: 0, max: 360});

            console.log(degree-90, degree)

            elementList.forEach(
                (e) => {
                    if ((e.startDegree < degree-90) && (e.endDegree > degree-90)) {
                        setRotate(-degree-1440)
                        setTimeout(()=>{setSelectedPrize(e.id)}, 5000)
                        return
                    }else
                    if ((e.startDegree < degree-90-360) && (e.endDegree > degree-90-360)) {
                        setRotate(-degree-1440)
                        setTimeout(()=>{setSelectedPrize(e.id)}, 5000)
                        return
                    }
                }
            )

            setTimeout(()=>{setIsTurning(false)}, 5000)
        }, 200)

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
                           elementList={elementList}></Turntable>
            </Box>
            <Box id={"user-ui"}
                 marginX={"auto"}
            >
                <Button
                    className={`${AppStyle.startButton}`}
                    onClick={turnTurnTable}
                    disabled={isTurning}
                >
                    抽奖
                </Button>
                <Switch onChange={(e)=>{
                    if (e.target.checked) {
                        setSecondCSV()
                    } else {
                        setDefaultCSV()
                    }
                }}></Switch>
                {selectedPrize ? elementList[selectedPrize-1].name : ""}
            </Box>
        </Box>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow selected={true}>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Chance</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        elementList.map((row, i) => {
                            return <TableRow key={i} selected={i+1 === selectedPrize}>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell>{row.chance}</TableCell>
                            </TableRow>
                        })
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
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