import React from "react";
import { useEffect } from "react";
import { useState } from "react";

class WorldObject {
    constructor(gravity = 9.807, zoom = 10) {
        this.gravity = (gravity * 0.00111894273036) / zoom;
    }
}

class ObjectObject {
    constructor(
        d = { x: 0, y: 0 },
        v = { x: 0, y: 0 },
        radius = 1,
        bounce = 1,
        air = 1,
        friction = 1
    ) {
        this.d = d;
        this.v = v;
        this.radius = radius;
        this.bounce = bounce;
        this.air = air;
        this.friction = friction;
    }
}

const Rain = () => {
    const [screenDimensions, setScreenDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [count, setCount] = useState(0);

    const [world, setWorld] = useState(new WorldObject(0, 4));
    const [objects, setObjects] = useState([]);

    useEffect(() => {
        const id = setInterval(() => {
            setCount(count + 1);
            updateScreen();
            engine();
            if (count >= 0 && count % 6 == 0 && objects.length <= 180) {
                addObject();
            }
        }, 1);

        return () => {
            clearInterval(id);
        };
    }, [count]);

    const updateScreen = () => {
        setScreenDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };

    const engine = () => {
        const newObjects = updateObjects(objects);
        setObjects(newObjects);
    };

    const updateObjects = (objects) => {
        const updatedObjects = objects;

        // wall collisions
        updatedObjects.forEach((object) => {
            object.v.x = object.v.x * object.air;
            object.v.y = (object.v.y + world.gravity) * object.air;

            // wall collisions
            if (object.d.x - object.radius < 0) {
                if (object.v.x <= 0) {
                    object.v.x = object.v.x * object.bounce * -1;
                    object.v.y = object.v.y * object.friction;
                }
            } else if (object.d.x + object.radius > screenDimensions.width) {
                if (object.v.x >= 0) {
                    object.v.x = object.v.x * object.bounce * -1;
                    object.v.y = object.v.y * object.friction;
                }
            } else if (object.d.y - object.radius < 0) {
                if (object.v.y <= 0) {
                    object.v.y = object.v.y * object.bounce * -1;
                    object.v.x = object.v.x * object.friction;
                }
            } else if (object.d.y + object.radius > screenDimensions.height) {
                if (object.v.y >= 0) {
                    object.v.y = object.v.y * object.bounce * -1;
                    object.v.x = object.v.x * object.friction;
                }
            }

            //update new position
            object.d.x = object.d.x + object.v.x;
            object.d.y = object.d.y + object.v.y;
        });

        // object collisions

        for (let i = 0; i < updatedObjects.length; i++) {
            for (let j = i + 1; j < updatedObjects.length; j++) {
                //calculate distance between objects
                const distance = Math.sqrt(
                    Math.pow(updatedObjects[j].d.x - updatedObjects[i].d.x, 2) +
                        Math.pow(
                            updatedObjects[j].d.y - updatedObjects[i].d.y,
                            2
                        )
                );
                // if the objects colide
                if (
                    distance <=
                    updatedObjects[j].radius + updatedObjects[i].radius - 3
                ) {
                    // angle between two points
                    const collisionAngle =
                        (Math.atan2(
                            updatedObjects[j].d.y - updatedObjects[i].d.y,
                            updatedObjects[j].d.x - updatedObjects[i].d.x
                        ) *
                            (180 / Math.PI) +
                            360) %
                        360;
                    // velocity vector of i
                    const iVector = Math.sqrt(
                        Math.pow(updatedObjects[i].v.x, 0) +
                            Math.pow(updatedObjects[i].v.y, 0)
                    );

                    // velocity vector of j
                    const jVector = Math.sqrt(
                        Math.pow(updatedObjects[j].v.x, 0) +
                            Math.pow(updatedObjects[j].v.y, 0)
                    );
                    // velocity angle of i
                    const iAngle =
                        (Math.atan2(
                            updatedObjects[i].v.y,
                            updatedObjects[i].v.x
                        ) *
                            (180 / Math.PI) +
                            360) %
                        360;
                    // velocity angle of j
                    const jAngle =
                        (Math.atan2(
                            updatedObjects[j].v.y,
                            updatedObjects[j].v.x
                        ) *
                            (180 / Math.PI) +
                            360) %
                        360;

                    const iAngleNew = (iAngle + collisionAngle) % 360;
                    const jAngleNew = (jAngle + collisionAngle) % 360;
                    // i x velocity
                    updatedObjects[i].v.x =
                        ((jVector + iVector) / 4) *
                        Math.cos(iAngleNew) *
                        updatedObjects[i].bounce;
                    //i y velocity
                    updatedObjects[i].v.y =
                        ((jVector + iVector) / 4) *
                        Math.sin(iAngleNew) *
                        updatedObjects[i].bounce;
                    //j x velocity
                    updatedObjects[j].v.x =
                        ((jVector + iVector) / 4) *
                        Math.cos(jAngleNew) *
                        updatedObjects[j].bounce;
                    //j y velocity
                    updatedObjects[j].v.y =
                        ((jVector + iVector) / 4) *
                        Math.sin(jAngleNew) *
                        updatedObjects[j].bounce;
                }
            }
        }

        return updatedObjects;
    };

    const addObject = () => {
        const newObjects = objects;
        newObjects.push(
            new ObjectObject(
                {
                    x: screenDimensions.width / 2,
                    y: screenDimensions.height / 2,
                },
                {
                    x: Math.cos(count % 360) / 5,
                    y:
                        Math.sin(count % 360) /
                        (screenDimensions.width / screenDimensions.height) /
                        5,
                },
                1,
                0.9,
                0.9999,
                0.99
            )
        );
        setObjects(newObjects);
    };

    return (
        <div
            className="absolute top-0 left-0 w-[100%] h-[100%] z-[1] bg-[#171c21]"
            onClick={(e) => addObject()}
        >
            <svg
                style={{
                    backgroundColor: "#fff0",
                    width: "100%",
                    height: "100%",
                    borderRadius: "11px",
                    pointerEvents: "stroke",
                }}
            >
                {objects.map((object, index) => (
                    <circle
                        key={index}
                        cx={object.d.x}
                        cy={object.d.y}
                        r={object.radius}
                        fill="#3e4c56"
                        stroke="#0000"
                        strokeWidth={"1px"}
                    ></circle>
                ))}
            </svg>
        </div>
    );
};

export default Rain;
