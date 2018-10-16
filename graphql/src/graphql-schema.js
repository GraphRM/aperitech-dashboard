import { neo4jgraphql } from "neo4j-graphql-js";
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import fs from 'fs';
import path from 'path';

export const typeDefs = 
  fs.readFileSync(process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql"))
    .toString('utf-8');

// There's no native Date type in GraphQL so we create one and explain it how to handle it
const DateType = new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value) // ast value is always in string format
      }
      return null;
    },
  });

// now export the resolvers
export const resolvers = {
  Date: DateType,
  Query: {
    allMeetups: neo4jgraphql,
    allTags: neo4jgraphql,
    eventsByMeetup: neo4jgraphql
  }
};