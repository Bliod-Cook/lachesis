import {useRef} from "react";
import {Box} from "@mui/material";
import './turntable.css'
import {singleElement} from "../App.tsx";


export default function Turntable({width, height, elementList, rotateDegree}: {
    width: number,
    height: number,
    elementList: singleElement[],
    rotateDegree: number,
}) {
    const wheelRef = useRef(null)

    const radius = 240;
    const labelRadius = 220;

    const totalChance = elementList.map((e) => {
        return e.chance
    }).reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    let degree = -90-(elementList[0].chance/totalChance*180)

    return (
        <Box width={width} height={height}
             position={"relative"}
        >
            <svg
                ref={wheelRef}
                width={width}
                height={height}
            >
                <g id={"table"} className={`table`} transform={`rotate(${rotateDegree})`} style={{
                    transition: rotateDegree === 0 ? "none": undefined,
                }}>
                    {
                        elementList.map((e) => {
                            const {id, chance, startDegree, endDegree, color, name} = e;

                            const angel = chance / totalChance * 2 * Math.PI;

                            const isLarge = angel >= Math.PI;

                            const centerX = width / 2;
                            const centerY = height / 2;

                            const startX = centerX + radius * Math.cos(startDegree/180*Math.PI);
                            const startY = centerY + radius * Math.sin(startDegree/180*Math.PI);

                            const endX = (centerX + radius * Math.cos(endDegree/180*Math.PI));
                            const endY = centerY + radius * Math.sin(endDegree/180*Math.PI);

                            const labelX = centerX + labelRadius * Math.cos((startDegree + endDegree) / 360 * Math.PI);
                            const labelY = centerY + labelRadius * Math.sin((startDegree + endDegree) / 360 * Math.PI);

                            let rotate = (startDegree + endDegree)/2 + 90;

                            if (rotate >= 180) {
                                rotate -= 360
                            }

                            const pathD = `M${centerX} ${centerY} L${startX} ${startY} A${radius} ${radius} ${rotate} ${isLarge ? "1" : "0"} 1 ${endX} ${endY} Z`

                            degree += angel

                            return <g key={id}>
                                <path
                                    d={pathD}
                                    fill={color}
                                    stroke={"black"}
                                ></path>
                                <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    transform={`rotate(${rotate}, ${labelX}, ${labelY})`}
                                    dominantBaseline="middle"
                                    style={{
                                        fontSize: '12px',
                                        userSelect: 'none',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {name}
                                </text>
                            </g>
                        })
                    }
                </g>
                <polygon
                    points={`${width / 2},${height / 2 - radius + 10} ${width / 2 - 10},${height / 2 - radius - 20} ${width / 2 + 10},${height / 2 - radius - 20}`}
                ></polygon>
            </svg>
        </Box>
    )
}