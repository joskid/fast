import jest from "jest";
import {
    AddDataMessageOutgoing,
    AddLinkedDataDataMessageOutgoing,
    DuplicateDataMessageOutgoing,
    GetDataDictionaryMessageIncoming,
    GetDataDictionaryMessageOutgoing,
    GetNavigationDictionaryMessageIncoming,
    GetNavigationDictionaryMessageOutgoing,
    InitializeMessageOutgoing,
    MessageSystemDataDictionaryTypeAction,
    MessageSystemDataTypeAction,
    MessageSystemNavigationDictionaryTypeAction,
    MessageSystemNavigationTypeAction,
    NavigationMessageOutgoing,
    RemoveDataMessageOutgoing,
    UpdateActiveIdDataDictionaryMessageIncoming,
    UpdateActiveIdDataDictionaryMessageOutgoing,
    UpdateActiveIdNavigationDictionaryMessageIncoming,
    UpdateActiveIdNavigationDictionaryMessageOutgoing,
    UpdateDataMessageOutgoing,
} from "./message-system.utilities.props";
import { MessageSystemType } from "./types";
import { getMessage } from "./message-system.utilities";
import { DataType } from "../data-utilities/types";
import { Data, DataDictionary, LinkedData } from "./data.props";
import { SchemaDictionary } from "./schema.props";

/* tslint:disable */
describe("getMessage", () => {
    describe("initialize", () => {
        test("should return messages sent with initial values provided", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            const message: InitializeMessageOutgoing = getMessage({
                type: MessageSystemType.initialize,
                data: dataBlob,
                schemaDictionary,
            }) as InitializeMessageOutgoing;

            expect(message.type).toEqual(MessageSystemType.initialize);
            expect(message.data).toEqual(dataBlob[0][dataBlob[1]].data);
            expect(message.schema).toEqual(schemaDictionary["foo"]);
            expect(typeof message.navigation).toEqual("object");
        });
    });
    describe("data", () => {
        test("should return a data blob with duplicated values", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                foo: "bar",
                            },
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const message: DuplicateDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.duplicate,
                sourceDataLocation: "foo",
            }) as DuplicateDataMessageOutgoing;

            expect(message.data).toEqual({ foo: ["bar", "bar"] });
        });
        test("should return a data blob without removed values", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                foo: "bar",
                            },
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const message: RemoveDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.remove,
                dataLocation: "foo",
            }) as RemoveDataMessageOutgoing;

            expect(message.data).toEqual({});
        });
        test("should return a data blob with added values", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {},
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const message: AddDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.add,
                dataLocation: "hello",
                data: "world",
                dataType: DataType.object,
            }) as AddDataMessageOutgoing;

            expect(message.data).toEqual({ hello: "world" });
        });
        test("should return a data blob with updated values", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {},
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const message: UpdateDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.update,
                dataLocation: "hello",
                data: "venus",
            }) as UpdateDataMessageOutgoing;

            expect(message.data).toEqual({ hello: "venus" });
        });
        test("should return a data blob with updated values when the data is at the root", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {},
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const message: UpdateDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.update,
                dataLocation: "",
                data: { hello: "venus" },
            }) as UpdateDataMessageOutgoing;

            expect(message.data).toEqual({ hello: "venus" });
        });
        test("should add linkedData to the data and the data dictionary", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {},
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.addLinkedData,
                linkedData,
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect(Array.isArray((message.data as any).linkedData)).toEqual(true);
            expect((message.data as any).linkedData.length).toEqual(1);

            const id: string = (message.data as any).linkedData[0].id;
            const dictionary: GetDataDictionaryMessageOutgoing = getMessage({
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.get,
            }) as GetDataDictionaryMessageOutgoing;

            expect(
                Object.keys(dictionary.dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.toEqual(-1);
            expect(dictionary.dataDictionary[0][id].data).toEqual(linkedData[0].data);
        });
        test("should add linkedData to the data and the data dictionary when specifying a dictionary ID", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {},
                        },
                        abc: {
                            schemaId: "foo",
                            data: {},
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.addLinkedData,
                dictionaryId: "abc",
                linkedData,
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect(
                Array.isArray((message.dataDictionary[0].abc.data as any).linkedData)
            ).toEqual(true);
            expect((message.dataDictionary[0].abc.data as any).linkedData.length).toEqual(
                1
            );

            const id: string = (message.dataDictionary[0].abc.data as any).linkedData[0]
                .id;
            const dictionary: GetDataDictionaryMessageOutgoing = getMessage({
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.get,
            }) as GetDataDictionaryMessageOutgoing;

            expect(
                Object.keys(dictionary.dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.toEqual(-1);
            expect(dictionary.dataDictionary[0][id].data).toEqual(linkedData[0].data);
            expect((dictionary.dataDictionary[0].abc.data as any).linkedData).toEqual([
                { id },
            ]);
        });
        test("should add linkedData to an existing array of linkedData items", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                linkedData: [
                                    {
                                        id: "foo",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "foo",
                            data: {
                                test: "hello world",
                            },
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: Data<unknown>[] = [
                {
                    schemaId: "foo",
                    data: {
                        hello: "world",
                    },
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.addLinkedData,
                linkedData,
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect(Array.isArray((message.data as any).linkedData)).toEqual(true);
            expect((message.data as any).linkedData.length).toEqual(2);

            const id: string = (message.data as any).linkedData[1].id;
            const dictionary: GetDataDictionaryMessageOutgoing = getMessage({
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.get,
            }) as GetDataDictionaryMessageOutgoing;

            expect(
                Object.keys(dictionary.dataDictionary[0]).findIndex(
                    (dictionaryKey: string) => {
                        return dictionaryKey === id;
                    }
                )
            ).not.toEqual(-1);
            expect(dictionary.dataDictionary[0][id].data).toEqual(linkedData[0].data);
        });
        test("should remove linkedData from the data and the data dictionary", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                linkedData: [
                                    {
                                        id: "data2",
                                    },
                                ],
                            },
                        },
                        data2: {
                            schemaId: "foo",
                            data: {
                                hello: "world",
                            },
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: LinkedData[] = [
                {
                    id: "data2",
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.removeLinkedData,
                linkedData,
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect((message.data as any).linkedData).toEqual([]);
        });
        test("should remove linkedData from the data and the data dictionary when specifying a dictionary ID", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data1: {
                            schemaId: "foo",
                            data: {
                                hello: "world",
                            },
                        },
                        data: {
                            schemaId: "foo",
                            data: {
                                linkedData: [
                                    {
                                        id: "data2",
                                    },
                                ],
                            },
                        },
                        data2: {
                            schemaId: "foo",
                            data: {
                                hello: "world",
                            },
                        },
                    },
                    "data1",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: LinkedData[] = [
                {
                    id: "data2",
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.removeLinkedData,
                linkedData,
                dictionaryId: "data",
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect((message.dataDictionary[0].data.data as any).linkedData).toEqual([]);
        });
        test("should reorder linkedData in the exist array of linkedData items", () => {
            getMessage({
                type: MessageSystemType.initialize,
                data: [
                    {
                        data: {
                            schemaId: "foo",
                            data: {
                                linkedData: [
                                    {
                                        id: "foo",
                                    },
                                    {
                                        id: "bar",
                                    },
                                ],
                            },
                        },
                        foo: {
                            schemaId: "foo",
                            data: {
                                test: "hello world",
                            },
                        },
                        bar: {
                            schemaId: "foo",
                            data: {
                                test: "hello world",
                            },
                        },
                    },
                    "data",
                ],
                schemaDictionary: {
                    foo: { id: "foo" },
                },
            });
            const linkedData: LinkedData[] = [
                {
                    id: "bar",
                },
                {
                    id: "foo",
                },
            ];
            const message: AddLinkedDataDataMessageOutgoing = getMessage({
                type: MessageSystemType.data,
                action: MessageSystemDataTypeAction.reorderLinkedData,
                linkedData,
                dataLocation: "linkedData",
            }) as AddLinkedDataDataMessageOutgoing;

            expect(Array.isArray((message.data as any).linkedData)).toEqual(true);
            expect((message.data as any).linkedData.length).toEqual(2);
            expect((message.data as any).linkedData[0].id).toEqual("bar");
            expect((message.data as any).linkedData[1].id).toEqual("foo");
        });
    });
    describe("navigation", () => {
        test("should return messages sent with navigation updates", () => {
            const dictionaryId: string = "foo";
            const navigationConfigId: string = "";
            const message: NavigationMessageOutgoing = getMessage({
                type: MessageSystemType.navigation,
                action: MessageSystemNavigationTypeAction.update,
                activeDictionaryId: dictionaryId,
                activeNavigationConfigId: navigationConfigId,
            }) as NavigationMessageOutgoing;

            expect(message.type).toEqual(MessageSystemType.navigation);
            expect(message.action).toEqual(MessageSystemNavigationTypeAction.update);
            expect(message.activeDictionaryId).toEqual(dictionaryId);
            expect(message.activeNavigationConfigId).toEqual(navigationConfigId);
        });
    });
    describe("dataDictionary", () => {
        test("should return messages sent to get the data dictionary", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage({
                type: MessageSystemType.initialize,
                data: dataBlob,
                schemaDictionary,
            });
            const getDataDictionary: GetDataDictionaryMessageOutgoing = getMessage({
                type: MessageSystemType.dataDictionary,
                action: MessageSystemDataDictionaryTypeAction.get,
            } as GetDataDictionaryMessageIncoming) as GetDataDictionaryMessageOutgoing;

            expect(getDataDictionary.type).toEqual(MessageSystemType.dataDictionary);
            expect(getDataDictionary.action).toEqual(
                MessageSystemDataDictionaryTypeAction.get
            );
            expect(getDataDictionary.dataDictionary).toEqual(dataBlob);
            expect(getDataDictionary.activeDictionaryId).toEqual(dataBlob[1]);
        });
        test("should return messages set to update the active id of the data dictionary", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    abc: {
                        schemaId: "foo",
                        data: {
                            foo: [
                                {
                                    id: "def",
                                },
                            ],
                        },
                    },
                    def: {
                        schemaId: "foo",
                        parent: {
                            id: "abc",
                            dataLocation: "foo",
                        },
                        data: {
                            bat: "baz",
                        },
                    },
                },
                "abc",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage({
                type: MessageSystemType.initialize,
                data: dataBlob,
                schemaDictionary,
            });

            const updateDataDictionaryActiveId: UpdateActiveIdDataDictionaryMessageOutgoing = getMessage(
                {
                    type: MessageSystemType.dataDictionary,
                    action: MessageSystemDataDictionaryTypeAction.updateActiveId,
                    activeDictionaryId: "def",
                } as UpdateActiveIdDataDictionaryMessageIncoming
            ) as UpdateActiveIdDataDictionaryMessageOutgoing;

            expect(updateDataDictionaryActiveId.type).toEqual(
                MessageSystemType.dataDictionary
            );
            expect(updateDataDictionaryActiveId.action).toEqual(
                MessageSystemDataDictionaryTypeAction.updateActiveId
            );
            expect(updateDataDictionaryActiveId.activeDictionaryId).toEqual("def");
        });
    });
    describe("navigationDictionary", () => {
        test("should return messages sent to get the navigation dictionary", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage({
                type: MessageSystemType.initialize,
                data: dataBlob,
                schemaDictionary,
            });
            const getNavigationDictionary: GetNavigationDictionaryMessageOutgoing = getMessage(
                {
                    type: MessageSystemType.navigationDictionary,
                    action: MessageSystemNavigationDictionaryTypeAction.get,
                } as GetNavigationDictionaryMessageIncoming
            ) as GetNavigationDictionaryMessageOutgoing;

            expect(getNavigationDictionary.type).toEqual(
                MessageSystemType.navigationDictionary
            );
            expect(getNavigationDictionary.action).toEqual(
                MessageSystemNavigationDictionaryTypeAction.get
            );
            expect(getNavigationDictionary.navigationDictionary).not.toEqual(undefined);
            expect(getNavigationDictionary.activeDictionaryId).not.toEqual(undefined);
        });
        test("should return messages set to update the active id of the navigation dictionary", () => {
            const dataBlob: DataDictionary<unknown> = [
                {
                    data: {
                        schemaId: "foo",
                        data: {
                            foo: "bar",
                        },
                    },
                },
                "data",
            ];
            const schemaDictionary: SchemaDictionary = {
                foo: { id: "foo" },
            };
            getMessage({
                type: MessageSystemType.initialize,
                data: dataBlob,
                schemaDictionary,
            });

            const updateNavigationDictionaryActiveId: UpdateActiveIdNavigationDictionaryMessageOutgoing = getMessage(
                {
                    type: MessageSystemType.navigationDictionary,
                    action: MessageSystemNavigationDictionaryTypeAction.updateActiveId,
                    activeDictionaryId: "nav2",
                } as UpdateActiveIdNavigationDictionaryMessageIncoming
            ) as UpdateActiveIdNavigationDictionaryMessageOutgoing;

            expect(updateNavigationDictionaryActiveId.type).toEqual(
                MessageSystemType.navigationDictionary
            );
            expect(updateNavigationDictionaryActiveId.action).toEqual(
                MessageSystemNavigationDictionaryTypeAction.updateActiveId
            );
            expect(updateNavigationDictionaryActiveId.activeDictionaryId).toEqual("nav2");
        });
    });
});